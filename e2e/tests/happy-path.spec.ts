import { paymentFormSelectors, paymentProcessingSelectors, paymentSuccessSelectors } from "../selectors"

describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the homepage', () => {
    cy.getBySelector(paymentFormSelectors.formContainer).should('exist')

    cy.getBySelector(paymentFormSelectors.amountInput).type('100')
    cy.getBySelector(paymentFormSelectors.amountInputErrorLabel).should('not.be.visible')

    cy.getBySelector(paymentFormSelectors.cardHolderNameInput).type('John Doe')
    cy.getBySelector(paymentFormSelectors.cardHolderNameInputErrorLabel).should('not.be.visible')

    cy.getBySelector(paymentFormSelectors.cardNumberInput).type('4444333322221111')
    cy.getBySelector(paymentFormSelectors.cardNumberInputErrorLabel).should('not.be.visible')

    cy.getBySelector(paymentFormSelectors.expiryDateInput).type('12/25')
    cy.getBySelector(paymentFormSelectors.expiryDateInputErrorLabel).should('not.be.visible')

    cy.getBySelector(paymentFormSelectors.cvvInput).type('123')
    cy.getBySelector(paymentFormSelectors.cvvInputErrorLabel).should('not.be.visible')

    cy.getBySelector(paymentFormSelectors.submitButton).click()

    cy.getBySelector(paymentProcessingSelectors.processingContainer).should('be.visible')

    cy.getBySelector(paymentSuccessSelectors.successContainer).should('be.visible')
  })
})
