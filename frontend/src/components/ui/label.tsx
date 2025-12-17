import * as React from "react";

import { cn } from "../../lib/utils";

// Since we didn't install radix-ui/react-label, I'll make a simple implementation 
// but generally it's better to stick to a standard HTML label if dependencies aren't there.
// However, the prompt asked for "Premium" design so I'll standard HTML label with good classes.
// I'll skip the radix dependency for now to avoid extra installs unless user asked, 
// but I'll make it compatible in style.

const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            className
        )}
        {...props}
    />
));
Label.displayName = "Label";

export { Label };
