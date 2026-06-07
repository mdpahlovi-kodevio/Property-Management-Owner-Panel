import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { FormAvatar } from './form-avatar'
import { FormImage } from './form-image'
import { FormInput } from './form-input'
import { FormModuleMap } from './form-module-map'
import { FormRadio } from './form-radio'
import { FormSearchableSelect } from './form-searchable-select'
import { FormSelect } from './form-select'
import { FormSubmit } from './form-submit'
import { FormTextarea } from './form-textarea'

export const { fieldContext, formContext, useFormContext, useFieldContext } = createFormHookContexts()

export const { useAppForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        FormAvatar,
        FormImage,
        FormInput,
        FormModuleMap,
        FormRadio,
        FormSearchableSelect,
        FormSelect,
        FormTextarea,
    },
    formComponents: {
        FormSubmit,
    },
})
