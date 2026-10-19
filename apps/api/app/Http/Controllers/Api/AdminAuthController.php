<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = Admin::where('email', $data['email'])->first();

        if (
            !$admin ||
            !$admin->is_active ||
            !Hash::check($data['password'], $admin->password)
        ) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are invalid.'],
            ]);
        }

        $token = $admin
            ->createToken('pulsetrack-owner-dashboard')
            ->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (!$admin instanceof Admin) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (!$admin instanceof Admin) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $admin->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }


    public function projects(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (!$admin instanceof Admin || !$admin->is_active) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $projects = $admin->projects()
            ->select(
                'id',
                'name',
                'public_key',
                'server_key_hash as server_key',
                'created_at'
            )
            ->orderBy('name')
            ->get();

        return response()->json([
            'projects' => $projects,
        ]);
    }

    
    public function createProject(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (!$admin instanceof Admin || !$admin->is_active) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        do {
            $publicKey = 'pk_' . bin2hex(random_bytes(16));
        } while (\App\Models\Project::where('public_key', $publicKey)->exists());

        // Generate a secret server key.
        $serverKey = 'sk_' . bin2hex(random_bytes(32));

        // Store only the hash of the server key.
        $project = $admin->projects()->create([
            'name' => $validated['name'],
            'public_key' => $publicKey,
            'server_key_hash' => $serverKey,
        ]);

        return response()->json([
            'message' => 'Project created successfully.',
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'public_key' => $project->public_key,

                // Return this secret only at creation time.
                'server_key' => $serverKey,

                'created_at' => $project->created_at,
            ],
        ], 201);
    }



    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:admins,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $admin = Admin::create([
            'name' => $data['name'],
            'email' => strtolower($data['email']),
            'password' => $data['password'],
            'is_active' => true,
        ]);

        $token = $admin
            ->createToken('pulsetrack-owner-dashboard')
            ->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'token' => $token,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
        ], 201);
    }



    public function rotateServerKey(Request $request, int $projectId): JsonResponse
    {
        $admin = $request->user();

        if (!$admin instanceof Admin || !$admin->is_active) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $project = $admin->projects()->find($projectId);

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $serverKey = 'sk_' . bin2hex(random_bytes(32));

        $project->server_key_hash = $serverKey;
        $project->save();

        return response()->json([
            'message' => 'Server key rotated successfully.',
            'server_key' => $serverKey,
        ]);
    }

}
