const Sb = ({str,className, ...rest}) => {
	return (
		<sub
			className={className}
			{...rest}>
				{str}
			</sub>
	)
}

export default Sb