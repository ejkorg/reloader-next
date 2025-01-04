import * as React from "react"
import TextField from "@mui/material/TextField"

import { cn } from "@/utils/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof TextField>>(
  ({ className, ...props }, ref) => {
    return (
      <TextField
        inputRef={ref}
        className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
