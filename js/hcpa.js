/* 
	HCPA - created by Lee Tobin (lee.tobin@ucdconnect.ie) 
	---
	All code by Lee Tobin - 2018
*/

/* global addDomel */

let hcpa = (function () {
	
	let treeLevel = 0
	function init() {
	
		hcpa.data.readLS()
		drawTree()
		hcpa.mouse.events()
		hcpa.keyboard.events()
	}


	function drawBranch(node) {
		
		let treeContent = `<ul id="${treeLevel+=1}">`
		node.map(n=>{
			treeContent += `<li id="${n.id}"><div ondrop="hcpa.mouse.drop(event)" 
				ondragover="hcpa.mouse.allowDrop(event)"  
				draggable="true" 
				ondragstart="hcpa.mouse.drag(event)" 
				class="nodeContainer" 
				id="grab_${n.id}">
				<div class="name">${n.name}</div>`
			
			if(n.children.length>0) treeContent += `<div class="cpaPopout" data-id="${n.id}">&#9776;</div>`
			n.values.forEach(v=>{
				treeContent += `<div class="nodeValue">${v.name}<span class="nodeValueResult">${((v.weight===undefined)?"":parseFloat(v.weight.toFixed(2)))}<span></div>`
			})
			treeContent +=` </div>`
			
			if(n.children.length>0)
				treeContent += drawBranch(n.children)
			
			treeContent += "</li>"
		})
		treeContent += "</ul>"
		return treeContent
	}
	
	function drawTree(){
		treeLevel = 0
		document.getElementById('hcpaTree').innerHTML = "" //clear it
		addDomel( drawBranch(hcpa.data.tree) ,'#hcpaTree')
	}
	
	
	return {
		init: init,
		drawTree:drawTree
	}
}())
