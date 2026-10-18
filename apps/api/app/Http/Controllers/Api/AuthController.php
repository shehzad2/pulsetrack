<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PhoneOtp;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function normalizeMobile(string $mobile): string
    {
        $digits = preg_replace('/\D+/', '', $mobile);

        // Accept Indian numbers with or without the +91 prefix.
        if (strlen($digits) === 10) {
            $digits = '91'.$digits;
        }

        if (!preg_match('/^91[6-9][0-9]{9}$/', $digits)) {
            throw ValidationException::withMessages([
                'mobile_number' => 'Enter a valid Indian mobile number.',
            ]);
        }

        return '+'.$digits;
    }

    public function requestOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mobile_number' => ['required', 'string', 'max:20'],
            'purpose' => ['required', 'in:register,login'],
            'name' => ['required_if:purpose,register', 'nullable', 'string', 'max:100'],
        ]);

        $mobile = $this->normalizeMobile($data['mobile_number']);
        $purpose = $data['purpose'];

        $rateKey = 'otp-request:'.$request->ip().':'.$mobile;

        if (RateLimiter::tooManyAttempts($rateKey, 5)) {
            return response()->json([
                'message' => 'Too many OTP requests. Please try again later.',
            ], 429);
        }

        RateLimiter::hit($rateKey, 60);

        $user = User::where('mobile_number', $mobile)->first();

        if ($purpose === 'register' && $user) {
            return response()->json([
                'message' => 'If this number can be registered, an OTP will be available shortly.',
            ]);
        }

        if ($purpose === 'login' && !$user) {
            return response()->json([
                'message' => 'If this number is registered, an OTP will be available shortly.',
            ]);
        }

        $previous = PhoneOtp::where('mobile_number', $mobile)
            ->where('purpose', $purpose)
            ->latest('id')
            ->first();

        if ($previous?->last_sent_at &&
            $previous->last_sent_at->gt(now()->subSeconds(60))) {
            return response()->json([
                'message' => 'Please wait before requesting another OTP.',
            ], 429);
        }

        $code = (string) random_int(100000, 999999);

        PhoneOtp::where('mobile_number', $mobile)
            ->where('purpose', $purpose)
            ->delete();

        PhoneOtp::create([
            'mobile_number' => $mobile,
            'purpose' => $purpose,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(5),
            'attempts' => 0,
            'last_sent_at' => now(),
        ]);

        $response = [
            'message' => 'If this number can be verified, an OTP will be available shortly.',
        ];

        // Local testing only. Never expose OTPs in production.
        if (app()->environment('local')) {
            $response['development_otp'] = $code;
        }

        return response()->json($response);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mobile_number' => ['required', 'string', 'max:20'],
            'purpose' => ['required', 'in:register,login'],
            'otp' => ['required', 'digits:6'],
            'name' => ['required_if:purpose,register', 'nullable', 'string', 'max:100'],
        ]);

        $mobile = $this->normalizeMobile($data['mobile_number']);
        $purpose = $data['purpose'];

        $rateKey = 'otp-verify:'.$request->ip().':'.$mobile;

        if (RateLimiter::tooManyAttempts($rateKey, 10)) {
            return response()->json([
                'message' => 'Too many verification attempts. Please try again later.',
            ], 429);
        }

        RateLimiter::hit($rateKey, 60);

        $otp = PhoneOtp::where('mobile_number', $mobile)
            ->where('purpose', $purpose)
            ->latest('id')
            ->first();

        if (!$otp || $otp->expires_at->isPast() || $otp->attempts >= 5) {
            throw ValidationException::withMessages([
                'otp' => 'The OTP is invalid or expired. Request a new code.',
            ]);
        }

        if (!Hash::check($data['otp'], $otp->code_hash)) {
            $otp->increment('attempts');

            throw ValidationException::withMessages([
                'otp' => 'The OTP is invalid or expired. Request a new code.',
            ]);
        }

        $user = DB::transaction(function () use ($mobile, $purpose, $data) {
            if ($purpose === 'register') {
                if (User::where('mobile_number', $mobile)->exists()) {
                    throw ValidationException::withMessages([
                        'mobile_number' => 'This mobile number is already registered. Please log in.',
                    ]);
                }

                return User::create([
                    'name' => $data['name'],
                    'mobile_number' => $mobile,
                    'mobile_verified_at' => now(),
                ]);
            }

            $user = User::where('mobile_number', $mobile)->first();

            if (!$user || !$user->mobile_verified_at) {
                throw ValidationException::withMessages([
                    'mobile_number' => 'Unable to verify this account. Please register first.',
                ]);
            }

            return $user;
        });

        $otp->delete();

        $token = $user->createToken('savory-web')->plainTextToken;

        return response()->json([
            'message' => $purpose === 'register'
                ? 'Registration successful.'
                : 'Login successful.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'mobile_number' => $user->mobile_number,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'mobile_number' => $user->mobile_number,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
