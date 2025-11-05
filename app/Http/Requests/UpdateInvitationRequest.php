<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInvitationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $routeInvitation = $this->route('invitation');
        $invitationId = is_object($routeInvitation) ? $routeInvitation->invitation_id : (int) $routeInvitation;

        return [
            // Wedding basic info
            'wedding_name' => [
                'required',
                'string',
                'max:255',
            ],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('invitations', 'slug')
                    ->ignore($invitationId, 'invitation_id'),
            ],
            
            // Groom information
            'groom_name' => [
                'required',
                'string',
                'max:255',
            ],
            'groom_alias' => [
                'required',
                'string',
                'max:100',
            ],
            'groom_image' => [
                'nullable', // Optional on update
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:2048',
            ],
            'groom_child_number' => [
                'required',
                'integer',
                'min:1',
                'max:20',
            ],
            'groom_father' => [
                'required',
                'string',
                'max:255',
            ],
            'groom_mother' => [
                'required',
                'string',
                'max:255',
            ],
            
            // Bride information
            'bride_name' => [
                'required',
                'string',
                'max:255',
            ],
            'bride_alias' => [
                'required',
                'string',
                'max:100',
            ],
            'bride_image' => [
                'nullable', // Optional on update
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:2048',
            ],
            'bride_child_number' => [
                'required',
                'integer',
                'min:1',
                'max:20',
            ],
            'bride_father' => [
                'required',
                'string',
                'max:255',
            ],
            'bride_mother' => [
                'required',
                'string',
                'max:255',
            ],
            
            // Wedding event details
            'wedding_date' => [
                'required',
                'date',
                // Remove 'after:today' for update to allow past edits
            ],
            'wedding_time_start' => [
                'required',
                'date_format:H:i',
            ],
            'wedding_time_end' => [
                'required',
                'date_format:H:i',
                'after:wedding_time_start',
            ],
            'wedding_venue' => [
                'required',
                'string',
                'max:255',
            ],
            'wedding_location' => [
                'required',
                'string',
                'max:500',
            ],
            'wedding_maps' => [
                'nullable', // Can be optional
                'url',
                'max:500',
            ],
            'wedding_image' => [
                'nullable', // Optional on update
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:2048',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'wedding_time_end.after' => 'End time must be after start time.',
            '*.image' => 'The file must be an image.',
            '*.mimes' => 'Only JPEG, PNG, JPG, and GIF images are allowed.',
            '*.max' => [
                'file' => 'The file size must not exceed 2MB.',
                'string' => 'The field must not exceed :max characters.',
            ],
            'slug.regex' => 'Slug can only contain lowercase letters, numbers, and hyphens.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            // Clean up text fields
            'wedding_name' => $this->cleanString($this->wedding_name),
            'groom_name' => $this->cleanString($this->groom_name),
            'bride_name' => $this->cleanString($this->bride_name),
            'groom_alias' => $this->cleanString($this->groom_alias),
            'bride_alias' => $this->cleanString($this->bride_alias),
            'groom_father' => $this->cleanString($this->groom_father),
            'groom_mother' => $this->cleanString($this->groom_mother),
            'bride_father' => $this->cleanString($this->bride_father),
            'bride_mother' => $this->cleanString($this->bride_mother),
            'wedding_venue' => $this->cleanString($this->wedding_venue),
            'wedding_location' => $this->cleanString($this->wedding_location),
            
            // Clean up slug
            'slug' => $this->slug ? strtolower(trim($this->slug)) : null,
        ]);
    }

    /**
     * Clean string by trimming and normalizing whitespace.
     */
    private function cleanString(?string $value): ?string
    {
        if (!is_string($value)) {
            return $value;
        }

        return trim(preg_replace('/\s+/', ' ', $value));
    }
}