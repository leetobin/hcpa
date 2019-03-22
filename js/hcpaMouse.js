/* 
	HCPA - created by Lee Tobin (lee.tobin@ucdconnect.ie) 
	---
	All code by Lee Tobin - 2018
*/

/* global cpa, hcpa, removeDomel, addDomel, untilElement */

hcpa.mouse = (function () { 	//Events

	function edit(event){
		let oldTitle = event.target.innerHTML
		removeDomel('editName')
		addDomel('<input type="text" id="editName" class="edits" />', event.target)

		document.getElementById('editName').value = oldTitle
		document.getElementById('editName').focus()
	}
	
	function events() {

	
		// -------------------- Edits
		document.addEventListener('dblclick', function (event) {
			if (event.target.matches('.name')) {
				edit(event)
			}
		})
	
		// ----------------------------- DOWN
		document.addEventListener('mousedown', function (event) {
			startEventPosition = {
				x: event.pageX, 
				y: event.pageY 
			}	
			
			if (event.target.closest('.nodeContainer')) {
				
				document.querySelectorAll('.selected').forEach((i)=>i.classList.remove('selected'))
				event.target.closest('.nodeContainer').classList.add('selected')
			}
	
			// -----------------------------  NAME
			if (event.target.matches('.name')) {
				if(event.altKey){
					if (event.target.matches('.name')) {
						edit(event)
					}
				}
			}
		
			// ----------------------------- CPA
			if (event.target.matches('.cpaPopout')) {
				
				document.getElementById('hcpaTree').classList.add('hidden')
				document.getElementById('edit-panel').classList.add('hidden')
		
				let nodeData = hcpa.data.findNode(event.target.dataset.id, hcpa.data.tree[0] )
				
				//c(JSON.stringify(nodeData,null,4))
				
				cpa.init("#container", hcpa.data.buildNodeCPA(nodeData), hcpa.data.saveCPAtoTree)
			}

				
			if (event.target.matches('input')) 	return; //don't get to panning if we click on an input element
			document.addEventListener('mousemove', movie )
		})
		
		
		// ----------------------------- UP
		
		document.addEventListener('mouseup', function(){
			document.removeEventListener('mousemove', movie)
		})	
		
	}
	

	// ----------------------------- ZOOMPAN
	function allowDrop(ev) {
		ev.stopPropagation()
		ev.preventDefault()
	}
	
	function drag(ev) {
		
		document.removeEventListener('mousemove', hcpa.mouse.movie)
		//c("Start drag", ev.target.id)
		ev.dataTransfer.setData("text", ev.target.id)
	}
		
	function drop(ev) {
		ev.preventDefault()		
		ev.stopPropagation() //don't bubble up to other nodes
		document.removeEventListener('mousemove', movie)
		if(ev.target.tagName === "DIV"){
			
			if(!document.getElementById(ev.dataTransfer.getData("text"))) return;
			
			let mover = document.getElementById(ev.dataTransfer.getData("text")).parentElement //grab the li(not the div)	
			let newLoc = untilElement(ev.target, 'li')
			let oldLoc = mover.parentElement.parentElement
			
			//Checks first
			if(mover.id === newLoc.id) return; //not on itself		
			//make sure we're not dropping a node into a decendant of itself. MARTY!
			if(mover.contains(newLoc.parentNode.parentNode)) return;
			
			
			if(!oldLoc.id || !newLoc.id || !mover.id) return -1;
			//c(oldLoc.id,newLoc.id,mover.id)
			let newLocChildren = hcpa.data.findNode(newLoc.id).children.length

			if(!hcpa.data.moveChild(oldLoc.id, newLoc.id, mover.id)) return -1; //move child
			
			//Tidy the DOM
			if( newLocChildren === 0){ //no list - so create a new ul to house
				//c("no list, creating...")
				//Also append cpapopout
				
				addDomel(`<div class="cpaPopout" data-id="${newLoc.id}">&#9776;</div>`, newLoc.childNodes[0])
				
				let newList = document.createElement('ul') //new list to hold node
				newList.appendChild( mover )
				newLoc.appendChild(newList)

			} else{	//append to list
				//c("appending...")
				newLoc.getElementsByTagName("ul")[0].appendChild( mover )
			}
			
			//Find empty lists and remove the popout for old location
			if(hcpa.data.findNode(oldLoc.id).children.length === 0){
				document.getElementById(oldLoc.id).querySelectorAll("ul").
					forEach((elem)=>elem.parentNode.removeChild(elem))
				oldLoc.querySelector(".cpaPopout").parentNode.removeChild(oldLoc.querySelector(".cpaPopout")) 
			}
		
		}
	}
	
	
	let startEventPosition	
	let boxPos = {
		x:0,
		y:0
	}
	let scale = 1
	
	function movie(e) {
		
		boxPos.x += (e.pageX - startEventPosition.x) / scale
		boxPos.y += (e.pageY - startEventPosition.y) / scale
		
		document.getElementById('container').style.left = boxPos.x + "px" // Set style
		document.getElementById('container').style.top = boxPos.y  + "px" // Set style
		
		startEventPosition = {
			x: e.pageX, 
			y: e.pageY 
		}
	}
	
	
	let currentScale = 1;

	let translateX = 0
	let translateY = 0

	const factor = 0.1
	const zoom = (nextScale, event) => {

		const ratio = 1 - nextScale / currentScale

		const {
			clientX,
			clientY
		} = event

		var x = parseFloat(document.getElementById("container").style.left) || 0  //handle panning
		var y = parseFloat(document.getElementById("container").style.top) || 0

		translateX += ((clientX -x) - translateX  ) * ratio
		translateY += ((clientY -y)- translateY  ) * ratio

		document.getElementById("container").style.transform = `translate(${translateX}px, ${translateY}px) scale(${nextScale})`

		currentScale = nextScale
	}


	document.addEventListener('wheel', function (e) {

		let delta = (e.deltaY < 0) ? 2:-2
		let nextScale = currentScale + delta * factor
		//limits
		if(nextScale < 0.2) nextScale = 0.2; if(nextScale > 5) nextScale = 5
		
		zoom(nextScale, e)
	})
		

	
	
	return {
		events: events,
		drag:drag,
		drop:drop,
		allowDrop:allowDrop
		
	}
}())