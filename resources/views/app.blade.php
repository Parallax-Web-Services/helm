<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
        <meta name="theme-color" content="#090810">
        <link rel="icon" type="image/png" href="{{ asset('brand/zefram-symbol.png') }}">
    </head>
    <body>
        @inertia
    </body>
</html>
