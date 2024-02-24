import { PlusCircleIcon } from '@heroicons/react/24/solid'
import { classNames } from '@sushiswap/ui'
import { Button, ButtonProps } from '@sushiswap/ui/components/button'
import React, { forwardRef } from 'react'

interface ViewAllButton extends ButtonProps {
  isSmall?: boolean
}

export const ViewAllButton = forwardRef<HTMLButtonElement, ViewAllButton>(
  ({ isSmall, className, ...rest }, ref) => (
    <Button
      icon={PlusCircleIcon}
      iconProps={{ fill: '#3B7EF6' }}
      ref={ref}
      variant="secondary"
      className={classNames(
        isSmall ? 'sm:hidden' : 'hidden sm:flex',
        className,
      )}
      {...rest}
    >
      View All
    </Button>
  ),
)

ViewAllButton.displayName = 'ViewAllButton'
