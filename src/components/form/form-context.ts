import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { FormAvatar } from './form-avatar'
import { FormGallery } from './form-gallery'
import { FormImage } from './form-image'
import { FormInput } from './form-input'
import { FormInputNumber } from './form-input-number'
import { FormInputOtp } from './form-input-otp'
import { FormModuleMap } from './form-module-map'
import { FormRadio } from './form-radio'
import { FormSearchableSelect } from './form-searchable-select'
import { FormSelect } from './form-select'
import { FormSubmit } from './form-submit'
import { FormSwitch } from './form-switch'
import { FormTags } from './form-tags'
import { FormTextarea } from './form-textarea'

export const { fieldContext, formContext, useFormContext, useFieldContext } = createFormHookContexts()

export const { useAppForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        FormAvatar,
        FormGallery,
        FormImage,
        FormInput,
        FormInputNumber,
        FormInputOtp,
        FormModuleMap,
        FormRadio,
        FormSearchableSelect,
        FormSelect,
        FormSwitch,
        FormTags,
        FormTextarea,
    },
    formComponents: {
        FormSubmit,
    },
})
