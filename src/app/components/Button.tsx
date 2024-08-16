import { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

//* This is creating a component look more into it
interface ButtonProps<T extends React.ElementType> {
  as?: T;
}

export default function Button<T extends React.ElementType = "button">({
  as,
  ...props
}: ButtonProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ButtonProps<T>>) {
  const Component = as || "button";

  return (
    <Component
      {...props}
      className={twMerge(
        "flex items-center justify-center gap-2 rounded bg-blue-500 p-5 text-white active:bg-blue-600 disabled:bg-gray-200 ",
        props.className
      )}
    />
  );
}
