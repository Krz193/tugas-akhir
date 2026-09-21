<?php

test('returns a redirect to login for guests', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});