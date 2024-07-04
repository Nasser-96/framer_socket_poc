export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export default function Button({ ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`p-2 border rounded-xl text-white whitespace-nowrap ${props.className}`}
    >
      {props.children}
    </button>
  );
}
