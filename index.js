// distinguishes macros from regular tags
export default function createElement(element, params, ...children) {
	/* eslint-disable indent */
	return element.call ?
			element(params === null ? {} : params, ...flatCompact(children)) :
			createNode(element, params, ...children);
	/* eslint-enable indent */
}

export function Fragment(_, ...children) {
	return children;
}

// generates a DOM element (signature determined by JSX)
// `params` describe attributes and/or properties, as determined by the
// respective type (string or boolean attributes vs. arbitrary properties)
// if a `ref` parameter is provided, it is expected to contain a `[refs, id]`
// tuple; `refs[id]` will be assigned the respective DOM node
// `children` is an array of strings, numbers or DOM elements
// adapted from uitil <https://github.com/FND/uitil>
export function createNode(tag, params, ...children) {
	params = params || {};

	let node = document.createElement(tag);
	Object.keys(params).forEach(param => {
		let value = params[param];
		switch(value) {
		// special-casing for node references
		case "ref":
			let [registry, name] = value;
			registry[name] = node;
			break;
		// blank attributes
		case null:
		case undefined:
			break;
		// boolean attributes (e.g. `<input … autofocus>`)
		case true:
			node.setAttribute(param, "");
			break;
		case false:
			break;
		// attributes vs. properties
		default:
			if(value.substr) {
				node.setAttribute(param, value);
			} else {
				node[param] = value;
			}
		}
	});

	// JSX-specific adjustments:
	// * discarding blank values to avoid conditionals within JSX (passing
	//   `undefined`/`null`/`false` is much simpler)
	// * `children` might contain nested arrays due to the use of
	//   collections within JSX (`{items.map(item => <span>{item}</span>)}`)
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
