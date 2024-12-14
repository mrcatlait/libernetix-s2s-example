import { Selectors } from './selector.type'

export const paymentFormSelectors = {
  formContainer: 'payment-form-container',
  amountInput: 'payment-form-amount-input',
  amountInputErrorLabel: 'payment-form-amount-input-error-label',
  cardHolderNameInput: 'payment-form-card-holder-name-input',
  cardHolderNameInputErrorLabel: 'payment-form-card-holder-name-input-error-label',
  cardNumberInput: 'payment-form-card-number-input',
  cardNumberInputErrorLabel: 'payment-form-card-number-input-error-label',
  expiryDateInput: 'payment-form-expiry-date-input',
  expiryDateInputErrorLabel: 'payment-form-expiry-date-input-error-label',
  cvvInput: 'payment-form-cvv-input',
  cvvInputErrorLabel: 'payment-form-cvv-input-error-label',
  submitButton: 'payment-form-submit-button',
} satisfies Selectors
