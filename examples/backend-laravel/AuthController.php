<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * AuthController for Cepat UI
 * 
 * Provides login, logout, register, and current user profile endpoints
 * structured to directly match the Cepat UI AuthAdapter schema:
 * {
 *   token: string,
 *   user: {
 *     id: string | number,
 *     email: string,
 *     name: string,
 *     role: string,
 *     roles?: string[],
 *     permissions?: string[],
 *     avatar?: string
 *   }
 * }
 */
class AuthController extends Controller
{
    /**
     * Handle user login request.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Create Sanctum personal access token
        $token = $user->createToken('cepat-ui-auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Handle user registration.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user', // Default role
        ]);

        $token = $user->createToken('cepat-ui-auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->formatUser($user),
        ], 201);
    }

    /**
     * Return authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    /**
     * Handle user logout (revoke current token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Helper to format User model into Cepat UI's expected User interface.
     */
    protected function formatUser(User $user): array
    {
        // Adjust these role/permission mapping logic according to your Spatie or custom RBAC system
        $role = $user->role ?? 'user';
        $roles = isset($user->roles) && is_array($user->roles) ? $user->roles : [$role];
        $permissions = $user->permissions ?? [];

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $role,
            'roles' => $roles,
            'permissions' => $permissions,
            'avatar' => $user->avatar ?? null,
        ];
    }
}
