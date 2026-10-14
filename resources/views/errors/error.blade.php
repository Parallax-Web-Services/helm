{{-- Rendered by the OAuth2 client for its timeout and logged-out pages. --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }} · {{ config('app.name') }}</title>
    <link rel="icon" href="/helm/mark.svg" type="image/svg+xml">
    <style>
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #07080d; color: #eef2f8; font: 16px/1.5 ui-sans-serif, system-ui, sans-serif; }
        .card { width: min(28rem, calc(100vw - 2rem)); box-sizing: border-box; padding: 2rem; text-align: center; border: 1px solid rgba(255, 255, 255, .1); border-radius: 1.5rem; background: rgba(255, 255, 255, .03); }
        .card img { width: 3rem; height: 3rem; }
        .eyebrow { margin: 1rem 0 .25rem; font-size: .75rem; letter-spacing: .2em; text-transform: uppercase; color: #94a3b8; }
        h1 { margin: 0; font-size: 1.5rem; }
        p { color: #94a3b8; }
        a.button { display: inline-block; margin-top: 1rem; padding: .6rem 1.25rem; border-radius: 999px; background: #e2e8f0; color: #07080d; font-weight: 600; text-decoration: none; }
        a.button:hover { background: #fff; }
    </style>
</head>
<body>
    <main class="card">
        <img src="/helm/mark.svg" alt="">
        <p class="eyebrow">{{ $code }}</p>
        <h1>{{ $title }}</h1>
        <p>{{ $message }}</p>
        <a class="button" href="{{ url('/') }}">{{ $button ?? 'Sign in' }}</a>
    </main>
</body>
</html>
