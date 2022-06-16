import React, { useCallback, useRef } from "react";
import AppInput from "renderer/components/AppInput";
import "../index.scss";

type AmountItemProps = {
  amount: number;
  onClick: (amount: number) => void;
  isSelected: boolean;
};

const AmountItem = ({ amount, onClick, isSelected }: AmountItemProps) => {
  const handleClick = useCallback(() => onClick(amount), [amount, onClick]);
  return (
    <div
      className={`input-item ${isSelected ? "active" : ""}`}
      onClick={handleClick}
    >
      <span>{amount}</span>
    </div>
  );
};

type AmountInputProps = {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  amountInput?: string;
  amount?: number;
  onChangeAmount: (amount: number) => void;
};

const AmountInput = ({
  onInputChange,
  amount,
  amountInput,
  onChangeAmount,
}: AmountInputProps) => {
  const amounts = useRef([1, 2, 3, 4]);
  const handleSelectAmount = useCallback(
    (item: number) => onChangeAmount(item),
    [onChangeAmount]
  );
  const renderAmountItem = useCallback(
    (el: number) => (
      <AmountItem
        key={el}
        amount={el}
        isSelected={el === amount}
        onClick={handleSelectAmount}
      />
    ),
    [amount, handleSelectAmount]
  );
  return (
    <div className="amount-input__wrap">
      {amounts.current.map(renderAmountItem)}
      <AppInput
        placeholder="Input"
        className="app-input-highlight"
        type="number"
        value={amountInput}
        onChange={onInputChange}
      />
    </div>
  );
};

export default AmountInput;
