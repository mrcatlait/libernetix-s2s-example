import { AsyncPipe } from '@angular/common'
import { TuiTextfield, TuiError, tuiTextfieldOptionsProvider, TuiButton } from '@taiga-ui/core'
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { TuiInputNumberModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy'
import {
  tuiCreateLuhnValidator,
  TuiCurrencyPipe,
  TuiInputCard,
  tuiInputCardOptionsProvider,
  TuiInputCVC,
  TuiInputExpire,
} from '@taiga-ui/addon-commerce'
import { TuiFieldErrorPipe, tuiValidationErrorsProvider } from '@taiga-ui/kit'
import { paymentFormSelectors } from '@selectors'

import { PaymentFormState } from './payment-form.state'

import { InitiatePaymentDto } from '@core/dtos'
import { Currency } from '@core/enums'
import { SelectorDirective } from '@core/directives'

@Component({
  selector: 's2s-payment-form',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    TuiError,
    TuiFieldErrorPipe,
    TuiInputCard,
    TuiInputCVC,
    TuiInputExpire,
    TuiCurrencyPipe,
    TuiInputNumberModule,
    TuiTextfieldControllerModule,
    TuiButton,
    TuiTextfield,
    SelectorDirective,
  ],
  providers: [
    PaymentFormState,
    tuiInputCardOptionsProvider({ autocomplete: true }),
    tuiTextfieldOptionsProvider({ cleaner: signal(true) }),
    tuiValidationErrorsProvider({
      required: 'Field is required',
      maxlength: ({ requiredLength }: { requiredLength: string }) => `Maximum length — ${requiredLength}`,
      minlength: ({ requiredLength }: { requiredLength: string }) => `Minimum length — ${requiredLength}`,
      min: ({ min }: { min: number }) => `Minimum — ${min}`,
    }),
  ],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFormComponent {
  private readonly state = inject(PaymentFormState)

  readonly loading = this.state.loading

  readonly selectors = paymentFormSelectors

  protected readonly form = new FormGroup({
    card: new FormControl('', [Validators.required, tuiCreateLuhnValidator('Card number is invalid')]),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    expire: new FormControl('', Validators.required),
    cvc: new FormControl('', Validators.required),
    amount: new FormControl(null, [Validators.required, Validators.min(0.01)]),
    currency: new FormControl({ value: '', disabled: true }, Validators.required),
  })

  constructor() {
    effect(() => {
      if (this.loading()) {
        this.form.disable()
      } else {
        this.form.enable()
      }

      this.form.controls.currency.disable()
    })
  }

  handleSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    const data = this.form.getRawValue()

    const payload: InitiatePaymentDto = {
      cardholderName: data.name ?? '',
      cardNumber: data.card ?? '',
      expires: data.expire ?? '',
      cvc: data.cvc ?? '',
      amount: Number(data.amount ?? 0),
      currency: Currency.EUR,
    }

    this.state.initiatePayment(payload)
  }
}
