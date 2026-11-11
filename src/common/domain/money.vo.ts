import { ValueObject } from './value-object.base';
import { BusinessRuleViolationException } from './domain-exception.base';

interface MoneyProps {
  amountMinor: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  public static fromMinorUnits(amountMinor: number, currency = 'USD'): Money {
    const normalized = Math.round(Number(amountMinor));
    if (Number.isNaN(normalized) || normalized < 0) {
      throw new BusinessRuleViolationException(
        `Invalid money amount: ${amountMinor}`,
      );
    }
    return new Money({ amountMinor: normalized, currency });
  }

  public static zero(currency = 'USD'): Money {
    return new Money({ amountMinor: 0, currency });
  }

  get amount(): number {
    return this.props.amountMinor;
  }

  get currency(): string {
    return this.props.currency;
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromMinorUnits(this.amount + other.amount, this.currency);
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromMinorUnits(
      Math.max(0, this.amount - other.amount),
      this.currency,
    );
  }

  public multiply(factor: number): Money {
    if (factor < 0) {
      throw new BusinessRuleViolationException(
        'Cannot multiply money by a negative factor',
      );
    }
    return Money.fromMinorUnits(Math.floor(this.amount * factor), this.currency);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new BusinessRuleViolationException(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
      );
    }
  }
}

