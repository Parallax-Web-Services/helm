<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'Helm') }}</title>

        {{-- Orbitron (display) and Exo 2 (body), both SIL Open Font License. --}}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700&family=Orbitron:wght@500;600;700&display=swap">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
        <meta name="theme-color" content="#04070c">
        <link rel="icon" type="image/svg+xml" href="{{ asset('helm/mark.svg') }}">
    </head>
    <body>
        @inertia
    </body>
</html>
