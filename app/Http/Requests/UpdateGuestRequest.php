<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGuestRequest extends FormRequest
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
        return [
            'guest_name' => 'required|string|max:255',
            'guest_gender' => 'required|in:Male,Female',
            'guest_category' => 'nullable|string|max:50',
            'guest_category_custom' => 'nullable|string|max:50',
            'guest_contact' => 'required|string|max:255',
            'guest_address' => 'required|string|max:500',
            'guest_attendance_status' => 'nullable|in:confirmed,attended,-',
            'guest_invitation_status' => 'nullable|in:sent,delivered,opened,-',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'guest_name' => 'guest name',
            'guest_gender' => 'gender',
            'guest_category' => 'category',
            'guest_contact' => 'contact information',
            'guest_address' => 'address',
            'guest_attendance_status' => 'attendance status',
            'guest_invitation_status' => 'invitation status',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'guest_name.required' => 'The guest name is required.',
            'guest_name.max' => 'The guest name may not be greater than 255 characters.',
            'guest_gender.required' => 'The gender is required.',
            'guest_gender.in' => 'The gender must be Male or Female.',
            'guest_category.max' => 'The category may not be greater than 50 characters.',
            'guest_contact.required' => 'The contact information is required.',
            'guest_contact.max' => 'The contact information may not be greater than 255 characters.',
            'guest_address.required' => 'The address is required.',
            'guest_address.max' => 'The address may not be greater than 500 characters.',
            'guest_attendance_status.in' => 'The attendance status must be confirmed, attended, or pending.',
            'guest_invitation_status.in' => 'The invitation status must be sent, delivered, opened, or not sent.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values if empty
        if (empty($this->guest_attendance_status)) {
            $this->merge(['guest_attendance_status' => '-']);
        }
        
        if (empty($this->guest_invitation_status)) {
            $this->merge(['guest_invitation_status' => '-']);
        }

        // Handle custom category - if custom category is provided, use it instead of selected category
        if (!empty($this->guest_category_custom)) {
            $this->merge(['guest_category' => $this->guest_category_custom]);
        }

        // Clean up empty strings to null
        $this->merge([
            'guest_category' => $this->guest_category ?: null,
        ]);
    }
}