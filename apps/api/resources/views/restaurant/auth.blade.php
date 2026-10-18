
@extends('layouts.restaurant')

@section('title', $mode === 'register' ? 'Create Account — Savory.' : 'Login — Savory.')

@section('content')
<section class="section">
    <div class="container">
        <div class="form-card">
            <p class="eyebrow">YOUR TABLE, YOUR WAY</p>

            <h1 style="font-size:36px;margin:10px 0 12px">
                {{ $mode === 'register' ? 'Create your account' : 'Welcome back' }}
            </h1>

            <p class="muted" style="margin-bottom:26px">
                Use your Indian mobile number to continue with Savory.
            </p>

            <form id="otp-form">
                <div class="form-field" id="name-field"
                     style="{{ $mode === 'register' ? '' : 'display:none' }}">
                    <label for="customer-name">Full name</label>
                    <input id="customer-name" name="name" maxlength="100"
                           autocomplete="name"
                           {{ $mode === 'register' ? 'required' : '' }}>
                </div>

                <div class="form-field">
                    <label for="mobile-number">Mobile number</label>
                    <input id="mobile-number" name="mobile_number"
                           type="tel" inputmode="numeric"
                           placeholder="10-digit mobile number"
                           pattern="[6-9][0-9]{9}"
                           maxlength="10" required>
                    <small class="muted">India (+91)</small>
                </div>

                <div class="form-field" id="otp-field" style="display:none">
                    <label for="otp">6-digit OTP</label>
                    <input id="otp" name="otp" inputmode="numeric"
                           pattern="[0-9]{6}" maxlength="6"
                           autocomplete="one-time-code">
                </div>

                <p id="auth-message" class="alert" style="display:none"
                   role="status"></p>

                <button type="submit" class="button" id="auth-submit"
                        style="width:100%">
                    Continue
                </button>
            </form>

            <p class="muted" style="text-align:center;margin-top:22px">
                @if ($mode === 'register')
                    Already registered?
                    <a class="text-link" href="{{ route('restaurant.login') }}">Log in</a>
                @else
                    New to Savory?
                    <a class="text-link" href="{{ route('restaurant.register') }}">Create account</a>
                @endif
            </p>

            <p style="text-align:center;margin-top:16px">
                <a class="text-link" href="{{ url('/') }}">← Continue browsing as a guest</a>
            </p>
        </div>
    </div>
</section>

<script>
(() => {
    const mode = @json($mode);
    const form = document.getElementById('otp-form');
    const otpField = document.getElementById('otp-field');
    const otpInput = document.getElementById('otp');
    const nameInput = document.getElementById('customer-name');
    const mobileInput = document.getElementById('mobile-number');
    const button = document.getElementById('auth-submit');
    const message = document.getElementById('auth-message');

    let otpRequested = false;

    function showMessage(text, error = true) {
        message.textContent = text;
        message.style.display = 'block';
        message.style.background = error ? '#fff0ed' : '#eaf5eb';
        message.style.color = error ? '#8e2f20' : '#235c31';
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        button.disabled = true;
        message.style.display = 'none';

        const mobile = mobileInput.value.trim();

        try {
            const endpoint = otpRequested
                ? '/api/v1/auth/verify-otp'
                : '/api/v1/auth/request-otp';

            const payload = {
                mobile_number: '+91' + mobile,
                purpose: mode
            };

            if (mode === 'register') {
                payload.name = nameInput.value.trim();
            }

            if (otpRequested) {
                payload.otp = otpInput.value.trim();
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                const errors = data.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : data.message;
                throw new Error(errors || 'Request failed. Please try again.');
            }

            if (!otpRequested) {
                otpRequested = true;
                otpField.style.display = 'grid';
                otpInput.required = true;
                otpInput.focus();
                button.textContent = 'Verify OTP';

                const developmentNote = data.development_otp
                    ? ' Development OTP: ' + data.development_otp
                    : '';

                showMessage(
                    (data.message || 'OTP requested.') + developmentNote,
                    false
                );
            } else {
                localStorage.setItem('savory_auth_token', data.token);
                localStorage.setItem('savory_auth_user', JSON.stringify(data.user));
                window.location.href = '/account';
            }
        } catch (error) {
            showMessage(error.message || 'Unable to connect to the server.');
        } finally {
            button.disabled = false;
        }
    });
})();
</script>
@endsection
