import React from 'react';

type ButtonProps = {
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
  [x: string]: string | number | React.ReactNode | (() => void) | undefined;
}

function Button({ as: Tag = 'button', children, className = '', onClick = () => {return;}, isLoading = false, ...rest }: ButtonProps) {
  const Element = Tag ;

  return <Element disabled={isLoading} {...rest} onClick={onClick} className={`py-[14px] px-6 font-semibold bg-primary-400 text-white rounded disabled:bg-gray-400 disabled: hover:bg-button-hover duration-150 flex items-center justify-center ${className} ${className.includes('px') ? '' : 'px-3'} ${className.includes('py') ? '' : 'py-2'} }`}>
    {children}
    <svg className={`${isLoading ? 'w-6 ml-2 scale-100' : 'w-0 ml-0 scale-0'} duration-75 ease-linear h-5`} version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" xmlSpace="preserve">
        <path fill="#000" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
            <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite" />
        </path>
    </svg>
  </Element>;
}

export default Button;