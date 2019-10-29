let BLANKS = [undefined, null, false];

// distinguishes macros from regular tags
export default function createElement(element, params, ...children) {
	/* eslint-disable indent */
	return element.call ?
			element(params === null ? {} : params, ...flatCompact(children)) :
			createNode(element, params, ...children);
	/* eslint-enable indent */
}

// renders `macro` into `container`, replacing any previous child elements
export function render(macro, params, container) {
	let nodes = macro(params);
	if(!nodes.pop) {
		nodes = [nodes];
	}

	container.innerHTML = "";
	nodes.forEach(node => {
		container.appendChild(node);
	});
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
	let { is } = params;

	let node = document.createElement(tag, is && { is });
	Object.keys(params).forEach(param => {
		let value = params[param];
		switch(value) {
		// special-casing for node references
		case "ref":
			var [registry, name] = value; // eslint-disable-line no-var
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

// flattens array while discarding blank values
function flatCompact(items) {
	return items.reduce((memo, item) => {
		/* eslint-disable indent */
		return BLANKS.indexOf(item) !== -1 ? memo :
				memo.concat(item.pop ? flatCompact(item) : item);
		/* eslint-enable indent */
	}, []);
}
