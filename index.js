// generates a DOM element (signature determined by JSX)
// `params` describe attributes and/or properties, as determined by the
// respective type (string or boolean attributes vs. arbitrary properties)
// if a `ref` parameter is provided, it is expected to contain a `[refs, id]`
// tuple; `refs[id]` will be assigned the respective DOM node
// `children` is an array of strings, numbers or DOM elements
// adapted from uitil <https://github.com/FND/uitil>
export default function createElement(tag, params, ...children) {
	params = params || {};

	let node = document.createElement(tag);
	Object.keys(params).forEach(param => {
		let value = params[param];
		// special-casing for node references
		if(param === "ref") {
			let [registry, name] = value;
			registry[name] = node;
			return;
		}
		// boolean attributes (e.g. `<input … autofocus>`)
		if(value === true) {
			value = "";
		} else if(value === false) {
			return;
		}
		// attributes vs. properties
		if(value.substr) {
			node.setAttribute(param, value);
		} else {
			node[param] = value;
		}
	});

	// JSX-specific adjustments:
	// * discarding blank values for convenience
	// * `children` might contain nested arrays due to the use of
	//   collections within JSX (`{items.map(item => <span>item</span>)}`)
	flatCompact(children).forEach(child => {
		if(child.substr || (typeof child === "number")) {
			child = document.createTextNode(child);
		}
		node.appendChild(child);
	});

	return node;
}

// flatten array while discarding blank values
function flatCompact(items) {
	return items.reduce((memo, item) => {
		let blank = item === null || item === undefined;
		return blank ? memo : memo.concat(item.pop ? flatCompact(item) : item);
	}, []);
}
