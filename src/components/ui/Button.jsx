import { forwardRef } from "react";

/**
* Reusable Button component
 * 
 * Props:
 *  variant  : 'primary' | 'secondary' | 'ghost' | 'danger'  (default: 'primary')
 *  size     : 'sm' | 'md' | 'lg'                            (default: 'md')
 *  icon     : lucide-react icon component (optional)
 *  iconPos  : 'left' | 'right'                              (default: 'left')
 *  fullWidth: boolean                                        (default: false)
 *  active   : boolean — forced active/selected state        (default: false)
 *  ...rest  : all native button props (onClick, disabled, type…)
 */

const Button = forwardRef(({
	children,
	variant  = 'primary',
	size		= 'md',
	icon : Icon,
	iconPos 		= 'left',
	fullWidth	= false,
	active		= false,
	className	= '',
	...rest
}, ref) => {

	const classes = [
		'btn',
		`btn--${variant}`,
		`btn--${size}`,
		fullWidth ? 'btn-full' : '',
		active    ? 'btn-active': '',
		className
	].filter(Boolean).join(' ')

	return(
		<button 
			ref={ref} 
			className={classes} 
			{...rest}>
			{Icon && iconPos === 'left' && <Icon size={16} aria-hidden />}
			{children && <span>{children}</span>}
			{Icon && iconPos === 'right'&& <Icon size={16} aria-hidden />}

		</button>
	)
})

Button.displayName = 'Button'
export default Button