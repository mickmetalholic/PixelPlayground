import type { Components } from 'react-markdown';

export const markdownComponents: Components = {
  code(props) {
    const { className, children, ...rest } = props;
    return (
      <code
        className={`rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-800 ${className ?? ''}`}
        {...rest}
      >
        {children}
      </code>
    );
  },
};
