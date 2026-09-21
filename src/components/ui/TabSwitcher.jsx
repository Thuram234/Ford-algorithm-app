/*
 * Reusable tab switcher bar
 *
 * Props:
 *  tabs     : [{ id: string, label: string, icon?: LucideIcon }]
 *  active   : string — currently active tab id
 *  onChange : (id: string) => void
 */

const TabSwitcher = ({ tabs = [], active, onChange}) => {
	return (
		<div className="tab-switcher">
			{tabs.map(({ id, label, icon: Icon}) => (
				<button
					key={id}
					className={`tab-switcher__btn ${active === id ? 'active' : ''}`}
					onClick={() => onChange(id)}
					>
						{Icon && <Icon size={15} aria-hidden />}
						<span>{label}</span>
					</button>
			))}
	</div>
	)
}

export default TabSwitcher