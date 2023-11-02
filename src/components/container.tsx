import { FormEventHandler } from "react";

function Container({children, className, as, ...rest} : {children: React.ReactNode, className?: string, as?: keyof JSX.IntrinsicElements,[x: string]: string | number | React.ReactNode | (() => void) | FormEventHandler<HTMLFormElement> | undefined}) {
    const Component = as ? as : 'div'
    return (
        <Component className={`max-w-6xl mx-auto px-3 ${className ? className : ''}`} {...rest}>
            {children}
        </Component>
    );
}

export default Container;