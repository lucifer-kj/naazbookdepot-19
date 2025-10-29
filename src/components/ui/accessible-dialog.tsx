import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { VisuallyHidden } from "./visually-hidden"

interface AccessibleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  hideTitle?: boolean
  hideDescription?: boolean
  children: React.ReactNode
  className?: string
}

export const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  open,
  onOpenChange,
  title = "Dialog",
  description = "Dialog content",
  hideTitle = false,
  hideDescription = false,
  children,
  className,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          {hideTitle ? (
            <VisuallyHidden>
              <DialogTitle>{title}</DialogTitle>
            </VisuallyHidden>
          ) : (
            <DialogTitle>{title}</DialogTitle>
          )}
          
          {hideDescription ? (
            <VisuallyHidden>
              <DialogDescription>{description}</DialogDescription>
            </VisuallyHidden>
          ) : (
            description && <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

// Export a hook for easier usage
export const useAccessibleDialog = (defaultOpen = false) => {
  const [open, setOpen] = React.useState(defaultOpen)
  
  const openDialog = () => setOpen(true)
  const closeDialog = () => setOpen(false)
  const toggleDialog = () => setOpen(!open)
  
  return {
    open,
    setOpen,
    openDialog,
    closeDialog,
    toggleDialog,
  }
}