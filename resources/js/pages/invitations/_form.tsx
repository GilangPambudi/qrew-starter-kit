import { useState } from 'react'
import { Form, Link } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Clock, Image as ImageIcon } from 'lucide-react'
import type { Invitation } from '@/types'
import { toast } from 'sonner'
import InputError from '@/components/input-error'

type Props = {
    action: string;
    method: 'post' | 'patch' | 'put';
    submitLabel?: string;
    cancelHref?: string;
    initial?: Partial<Pick<Invitation, 'invitation_id' | 'wedding_name' | 'slug' | 'groom_name' | 'bride_name' | 'groom_alias' | 'bride_alias' | 'groom_image' | 'bride_image' | 'groom_child_number' | 'bride_child_number' | 'groom_father' | 'groom_mother' | 'bride_father' | 'bride_mother' | 'wedding_date' | 'wedding_time_start' | 'wedding_time_end' | 'wedding_venue' | 'wedding_location' | 'wedding_maps' | 'wedding_image'>>;
};

export default function InvitationForm({ action, method, submitLabel = 'Save', cancelHref = '/invitations', initial = {} }: Props) {
    const [step, setStep] = useState(1)
    const [groomImagePreview, setGroomImagePreview] = useState<string | null>(
        initial.groom_image ? `/storage/${initial.groom_image}` : null
    )
    const [brideImagePreview, setBrideImagePreview] = useState<string | null>(
        initial.bride_image ? `/storage/${initial.bride_image}` : null
    )
    const [weddingImagePreview, setWeddingImagePreview] = useState<string | null>(
        initial.wedding_image ? `/storage/${initial.wedding_image}` : null
    )

    const generateSlug = (weddingName: string) => {
        if (weddingName) {
            return weddingName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '')
        }
        return ''
    }

    const handleImagePreview = (
        file: File | null,
        setter: (s: string | null) => void
    ) => {
        if (!file) return setter(null)
        const reader = new FileReader()
        reader.onload = (e) => setter(e.target?.result as string)
        reader.readAsDataURL(file)
    }

    const StepMilestone = () => (
        <div className="mb-2" aria-label={`Step ${step} of 3`}>
            <span className="text-xs text-muted-foreground block mb-2">Step {step} of 3</span>
            <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`h-2 w-24 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`}
                    />
                ))}
            </div>
        </div>
    )

    const hasExistingImage = (key: 'groom_image' | 'bride_image' | 'wedding_image') =>
        Boolean((initial as Record<string, unknown>)[key])

    const isEmpty = (v: unknown) => v === null || v === undefined || String(v).trim() === ''

    const validateStep = (current: number, formData: FormData) => {
        if (current === 1) {
            const missing: string[] = []
            if (isEmpty(formData.get('groom_name'))) missing.push('Groom full name')
            if (isEmpty(formData.get('groom_alias'))) missing.push('Groom nickname')
            if (isEmpty(formData.get('groom_child_number'))) missing.push('Groom child number')
            if (isEmpty(formData.get('groom_father'))) missing.push('Groom father')
            if (isEmpty(formData.get('groom_mother'))) missing.push('Groom mother')
            if (method === 'post' && !formData.get('groom_image') && !hasExistingImage('groom_image')) missing.push('Groom image')
            if (missing.length) {
                toast.error(`Please fill: ${missing.join(', ')}`)
                return false
            }
        }
        if (current === 2) {
            const missing: string[] = []
            if (isEmpty(formData.get('bride_name'))) missing.push('Bride full name')
            if (isEmpty(formData.get('bride_alias'))) missing.push('Bride nickname')
            if (isEmpty(formData.get('bride_child_number'))) missing.push('Bride child number')
            if (isEmpty(formData.get('bride_father'))) missing.push('Bride father')
            if (isEmpty(formData.get('bride_mother'))) missing.push('Bride mother')
            if (method === 'post' && !formData.get('bride_image') && !hasExistingImage('bride_image')) missing.push('Bride image')
            if (missing.length) {
                toast.error(`Please fill: ${missing.join(', ')}`)
                return false
            }
        }
        return true
    }

    const handleNext = (e: React.MouseEvent<HTMLButtonElement>, formEl: HTMLFormElement) => {
        e.preventDefault()
        e.stopPropagation()
        const formData = new FormData(formEl)
        if (!validateStep(step, formData)) return
        setTimeout(() => setStep((s) => Math.min(3, s + 1)), 0)
    }

    const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setTimeout(() => setStep((s) => Math.max(1, s - 1)), 0)
    }

    const handleWeddingNameChange = (e: React.ChangeEvent<HTMLInputElement>, form: HTMLFormElement) => {
        const value = e.target.value
        const slugInput = form.querySelector('#slug') as HTMLInputElement
        if (slugInput && !slugInput.value) {
            slugInput.value = generateSlug(value)
        }
    }

    const handleGenerateSlug = (e: React.MouseEvent<HTMLButtonElement>, form: HTMLFormElement) => {
        e.preventDefault()
        const weddingNameInput = form.querySelector('#wedding_name') as HTMLInputElement
        const slugInput = form.querySelector('#slug') as HTMLInputElement
        if (weddingNameInput && slugInput) {
            slugInput.value = generateSlug(weddingNameInput.value)
        }
    }

    const handleUseNicknames = (e: React.MouseEvent<HTMLButtonElement>, form: HTMLFormElement) => {
        e.preventDefault()
        const groomAliasInput = form.querySelector('#groom_alias') as HTMLInputElement
        const brideAliasInput = form.querySelector('#bride_alias') as HTMLInputElement
        const weddingNameInput = form.querySelector('#wedding_name') as HTMLInputElement
        
        if (groomAliasInput && brideAliasInput && weddingNameInput) {
            const groomAlias = groomAliasInput.value.trim()
            const brideAlias = brideAliasInput.value.trim()
            if (groomAlias || brideAlias) {
                weddingNameInput.value = `${groomAlias} & ${brideAlias}`.trim()
            }
        }
    }

    return (
        <Form method={method} action={action} options={{ preserveScroll: true }} className="space-y-6">
            {({ processing, recentlySuccessful, errors }) => (
                <>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                    {/* Step 1: Groom */}
                    <div style={{ display: step === 1 ? 'block' : 'none' }}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" /> Groom Details
                                        </CardTitle>
                                        <CardDescription>Fill in groom information</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="groom_name">Groom Full Name *</Label>
                                                <Input 
                                                    id="groom_name" 
                                                    name="groom_name"
                                                    defaultValue={initial.groom_name ?? ''} 
                                                    required 
                                                />
                                                <InputError message={errors.groom_name} />
                                            </div>
                                            <div>
                                                <Label htmlFor="groom_alias">Groom Nick Name *</Label>
                                                <Input 
                                                    id="groom_alias" 
                                                    name="groom_alias"
                                                    defaultValue={initial.groom_alias ?? ''} 
                                                    required 
                                                />
                                                <InputError message={errors.groom_alias} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="groom_image">Groom Image *</Label>
                                            <Input 
                                                id="groom_image" 
                                                name="groom_image"
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => handleImagePreview(e.target.files?.[0] ?? null, setGroomImagePreview)} 
                                            />
                                            <InputError message={errors.groom_image} />
                                            {groomImagePreview && (
                                                <div className="mt-2">
                                                    <img src={groomImagePreview} alt="Groom preview" className="h-32 w-32 object-cover rounded-md border" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="groom_child_number">Groom Child Number *</Label>
                                                <Input 
                                                    id="groom_child_number" 
                                                    name="groom_child_number"
                                                    type="number" 
                                                    defaultValue={initial.groom_child_number ?? ''} 
                                                    required 
                                                />
                                                <InputError message={errors.groom_child_number} />
                                            </div>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="groom_father">Groom Father *</Label>
                                                <Input 
                                                    id="groom_father" 
                                                    name="groom_father"
                                                    defaultValue={initial.groom_father ?? ''} 
                                                    required 
                                                />
                                                <InputError message={errors.groom_father} />
                                            </div>
                                            <div>
                                                <Label htmlFor="groom_mother">Groom Mother *</Label>
                                                <Input 
                                                    id="groom_mother" 
                                                    name="groom_mother"
                                                    defaultValue={initial.groom_mother ?? ''} 
                                                    required 
                                                />
                                                <InputError message={errors.groom_mother} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Step 2: Bride */}
                            <div style={{ display: step === 2 ? 'block' : 'none' }}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" /> Bride Details
                                        </CardTitle>
                                        <CardDescription>Fill in bride information</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="bride_name">Bride Full Name *</Label>
                                                <Input 
                                                    id="bride_name" 
                                                    name="bride_name"
                                                    defaultValue={initial.bride_name ?? ''} 
                                                    required 
                                                />
                                                <InputError message={errors.bride_name} />
                                            </div>
                                            <div>
                                                <Label htmlFor="bride_alias">Bride Nick Name *</Label>
                                                <Input 
                                                    id="bride_alias" 
                                                    name="bride_alias"
                                                    defaultValue={initial.bride_alias ?? ''} 
                                                    required 
                                                />
                                                <InputError message={errors.bride_alias} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="bride_image">Bride Image *</Label>
                                            <Input 
                                                id="bride_image" 
                                                name="bride_image"
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => handleImagePreview(e.target.files?.[0] ?? null, setBrideImagePreview)} 
                                            />
                                            <InputError message={errors.bride_image} />
                                            {brideImagePreview && (
                                                <div className="mt-2">
                                                    <img src={brideImagePreview} alt="Bride preview" className="h-32 w-32 object-cover rounded-md border" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="bride_child_number">Bride Child Number *</Label>
                                                <Input 
                                                    id="bride_child_number" 
                                                    name="bride_child_number"
                                                    type="number" 
                                                    defaultValue={initial.bride_child_number ?? ''} 
                                                    required 
                                                />
                                                <InputError message={errors.bride_child_number} />
                                            </div>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="bride_father">Bride Father *</Label>
                                                <Input 
                                                    id="bride_father" 
                                                    name="bride_father"
                                                    defaultValue={initial.bride_father ?? ''} 
                                                    required 
                                                />
                                                <InputError message={errors.bride_father} />
                                            </div>
                                            <div>
                                                <Label htmlFor="bride_mother">Bride Mother *</Label>
                                                <Input 
                                                    id="bride_mother" 
                                                    name="bride_mother"
                                                    defaultValue={initial.bride_mother ?? ''} 
                                                    required 
                                                />
                                                <InputError message={errors.bride_mother} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Step 3: Event */}
                            <div style={{ display: step === 3 ? 'block' : 'none' }}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="h-5 w-5" /> Event Details
                                        </CardTitle>
                                        <CardDescription>Specify when and where the wedding will take place</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="wedding_name">Wedding Name *</Label>
                                            <div className="flex gap-2">
                                                <Input 
                                                    id="wedding_name" 
                                                    name="wedding_name"
                                                    defaultValue={initial.wedding_name ?? ''} 
                                                    required 
                                                    onChange={(e) => handleWeddingNameChange(e, e.target.form!)}
                                                />
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    onClick={(e) => handleUseNicknames(e, (e.target as HTMLElement).closest('form')!)}
                                                >
                                                    Use nicknames
                                                </Button>
                                            </div>
                                            <InputError message={errors.wedding_name} />
                                        </div>
                                        <div>
                                            <Label htmlFor="slug">URL Slug</Label>
                                            <div className="flex gap-2">
                                                <Input 
                                                    id="slug" 
                                                    name="slug"
                                                    defaultValue={initial.slug ?? ''} 
                                                />
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    onClick={(e) => handleGenerateSlug(e, (e.target as HTMLElement).closest('form')!)}
                                                >
                                                    Generate
                                                </Button>
                                            </div>
                                            <InputError message={errors.slug} />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                URL: {typeof window !== 'undefined' ? window.location.origin : ''}/invitation/
                                                {((document.getElementById('slug') as HTMLInputElement)?.value || '')}
                                            </p>
                                        </div>
                                        <div>
                                            <Label htmlFor="wedding_date">Wedding Date *</Label>
                                            <Input 
                                                id="wedding_date" 
                                                name="wedding_date"
                                                type="date" 
                                                defaultValue={initial.wedding_date ? String(initial.wedding_date).slice(0, 10) : ''} 
                                                min={new Date().toISOString().split('T')[0]} 
                                                required 
                                            />
                                            <InputError message={errors.wedding_date} />
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="wedding_time_start">Start Time *</Label>
                                                <Input 
                                                    id="wedding_time_start" 
                                                    name="wedding_time_start"
                                                    type="time" 
                                                    defaultValue={initial.wedding_time_start ? initial.wedding_time_start.slice(0, 5) : ''} 
                                                    required 
                                                />
                                                <InputError message={errors.wedding_time_start} />
                                            </div>
                                            <div>
                                                <Label htmlFor="wedding_time_end">End Time *</Label>
                                                <Input 
                                                    id="wedding_time_end" 
                                                    name="wedding_time_end"
                                                    type="time" 
                                                    defaultValue={initial.wedding_time_end ? initial.wedding_time_end.slice(0, 5) : ''} 
                                                    required 
                                                />
                                                <InputError message={errors.wedding_time_end} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="wedding_venue">Venue Name *</Label>
                                            <Input 
                                                id="wedding_venue" 
                                                name="wedding_venue"
                                                defaultValue={initial.wedding_venue ?? ''} 
                                                placeholder="Grand Ballroom Hotel" 
                                                required 
                                            />
                                            <InputError message={errors.wedding_venue} />
                                        </div>
                                        <div>
                                            <Label htmlFor="wedding_location">Full Address *</Label>
                                            <Input 
                                                id="wedding_location" 
                                                name="wedding_location"
                                                defaultValue={initial.wedding_location ?? ''} 
                                                required 
                                            />
                                            <InputError message={errors.wedding_location} />
                                        </div>
                                        <div>
                                            <Label htmlFor="wedding_maps">Google Maps URL *</Label>
                                            <Input 
                                                id="wedding_maps" 
                                                name="wedding_maps"
                                                type="url" 
                                                defaultValue={initial.wedding_maps ?? ''} 
                                                placeholder="https://maps.google.com/..." 
                                                required 
                                            />
                                            <InputError message={errors.wedding_maps} />
                                        </div>
                                    </CardContent>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="wedding_image">Choose Image *</Label>
                                            <Input 
                                                id="wedding_image" 
                                                name="wedding_image"
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => handleImagePreview(e.target.files?.[0] ?? null, setWeddingImagePreview)} 
                                            />
                                            <InputError message={errors.wedding_image} />
                                            <p className="text-xs text-muted-foreground mt-1">Max 2MB. JPG, PNG, GIF allowed.</p>
                                        </div>
                                        {weddingImagePreview && (
                                            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                                                <img src={weddingImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Sticky Navigation Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                {/* Step Progress */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">Progress</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <StepMilestone />
                                        <div className="space-y-2">
                                            <div className={`flex items-center gap-2 text-sm ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                                                Groom Details
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                                                Bride Details
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
                                                Event Details
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end items-center gap-2">
                                            {step > 1 && (
                                                <Button type="button" variant="outline" size="sm" onClick={handleBack}>
                                                    Back
                                                </Button>
                                            )}

                                            <Button asChild size="sm" variant="destructive">
                                                <Link href={cancelHref}>Cancel</Link>
                                            </Button>

                                            {step < 3 ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={(e) => handleNext(e, (e.target as HTMLElement).closest('form')!)}
                                                >
                                                    Next
                                                </Button>
                                            ) : (
                                                <Button type="submit" size="sm" disabled={processing}>
                                                    {processing ? 'Saving...' : submitLabel}
                                                </Button>
                                            )}
                                        </div>

                                        {recentlySuccessful && (
                                            <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                                                <div className="w-2 h-2 rounded-full bg-green-600" />
                                                Saved successfully!
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Form>
    )
}