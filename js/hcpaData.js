/* 
	HCPA - created by Lee Tobin (lee.tobin@ucdconnect.ie) 
	---
	All code by Lee Tobin - 2018
*/

/* global cpa, hcpa */

hcpa.data = (function () {
		//Events
	function readLS(){
				
		try{
			Object.assign(hcpa.data, JSON.parse(localStorage.getItem("hcpaData")))
		}catch{
			console.log("Running locally, nothing will be stored")
		}
	
		
		if (!hcpa.data.tree) {
			hcpa.data.tree = []
		}
		
		return JSON.stringify(hcpa.data.tree)
	}
	
	function setDataFrom(from) {
		let d
		try{
			d = JSON.parse(from)
		}catch(e){
			//Problem with data
			return -1;
		}
		hcpa.data.tree = d
		saveLS()
		hcpa.drawTree()
	}
	
	function saveCPAtoTree(){
			
		if(cpa.data.params){
			
			let cpaNode = findNode(cpa.data.params[0].id,hcpa.data.tree[0])
			if(cpaNode) {
				//Update the parent node
				cpaNode.name = cpa.data.params[0].name
				cpaNode.values = cpa.data.params[0].values
				
				//And the children
				cpaNode.children.map((cp,i)=>{
					cp.name = cpa.data.params[i+1].name
					cp.values = cpa.data.params[i+1].values
				})
			}
		}
		saveLS()
	}
	
	function saveLS() {
		//create a property "tree" for it first
		try{
			localStorage.setItem("hcpaData", JSON.stringify({
				"tree": hcpa.data.tree 
				}))
		} catch{
			console.log("Running locally, nothing will be stored")
		}
	}

	function buildNodeCPA(n) {
		//Deep clone
		let parent = {
			"name":n.name,
			"id":n.id,
			"values":n.values.map(x=>{delete x.weight; return x}), //remove the weight from the first param (we calculate this)
			"question":true
		}
		let buildData = {}
		buildData['params'] = []
		buildData['params'].push(parent)
		
		n.children.forEach(x=>{
			let child = {
				"name": x.name,
				"id": x.id,
				"values": x.values,
				"question": false
			}
			buildData['params'].push(child)
		})
		
		
		buildData['ca'] = (n.caData) ? n.caData : {} //shallow copy
		buildData['settings'] = {
			"undecideds": document.getElementById('undecideds').checked,
			"node": n.id
		}
		buildData['logs'] = []
		
		return buildData
	}


	function updateParent(id){
			
		if( (id === undefined) || (!id)) return false; //don't over do it!
		if(id === hcpa.data.tree[0].id){ //if it's the root stop
			cpa.data.findQuestionWeights()
			return false;
		}
		
		let q = [], 
			x
		q.push(hcpa.data.tree[0])
		while(q.length>0){
			x = q.shift()
			if(x.children.length>0){
				for(let y of x.children){
					if(y.id === id) { 
						cpa.data.findQuestionWeights()
						cpa.init("#container", hcpa.data.buildNodeCPA(x), hcpa.data.saveCPAtoTree, true)
						
						return x.id;
					}
				}
				q.push(...x.children)
			}
		}

		return false
	}
	
	function removePCAD(vals, el) {
		el.forEach(n=>{
			//Update CA data - delete keys that are from moved item
			Object.keys(n.caData).map(x=>{
				//if the CA data has keys that are the moved item, delete them
				if(vals.includes(x)) delete n.caData[x]
			})
			
			//Update CA data - delete values that are from moved item
			Object.keys(n.caData).map(x=>{

				Object.keys(n.caData[x]).map(v=>{
					if(vals.includes(v)) delete n.caData[x][v]
				})
				
				if(Object.keys(n.caData[x]).length < 1) delete n.caData[x] //if it contains no values
			})

		})
	}
	
	function removeParentCAData(vals) {
		removePCAD(vals.map(v=>v.id), hcpa.data.tree )
	}
	
	function deleteNode(id, e){
		
		if(e.id === id) return true;
		
		if(e.children.length>0)
			e.children.slice().reverse().
				forEach(function(item, index, object) { //shallow copy and reverse so we can splice (this will reindex the children array)
					if ( deleteNode(id, item) ) { 
						e.children.splice(object.length - 1 - index, 1)
					}
			})
			
		return false;
	}
	
	function findNode(id, element){
		if(!element) element = hcpa.data.tree[0]
		if(element.id === id) return element
		else if (element.children !== null){
			let result = null
			for(let i=0; result === null && i < element.children.length; i+=1){
				result = findNode(id, element.children[i])
			}
			return result
		}
		return null
	}
	
	function moveChild(from, to, id){
		
		from = hcpa.data.findNode(from) //from json node
		to = hcpa.data.findNode(to) //to json node

		if(!from || !to) return false;
		let movingChild = from.children.filter(x=>x.id === id)[0] //find the child
		from.children = from.children.filter(x=>x.id !== id) // remove the child from old loc
		to.children.push(movingChild) //add the child to new loc
				
		//Update CA data - delete keys that are from moved item
		Object.keys(from.caData).map(x=>{
		
			//if the CA data has keys that are the moved item, delete them
			if(movingChild.values.map(v=>v.id).includes(x))	delete from.caData[x]		
		})
		
		//Update CA data - delete values that are from moved item
		Object.keys(from.caData).map(x=>{

			Object.keys(from.caData[x]).map(v=>{
				if(movingChild.values.map(v=>v.id).includes(v))	delete from.caData[x][v]
			})
			
			if(Object.keys(from.caData[x]).length < 1) delete from.caData[x] //if it contains no values
		})
		
		hcpa.data.saveLS()
		return true;
	}
	
	return {
		readLS: readLS,
		saveLS: saveLS,
		setDataFrom:setDataFrom,
		saveCPAtoTree:saveCPAtoTree,
		updateParent:updateParent,
		removeParentCAData:removeParentCAData,
		buildNodeCPA:buildNodeCPA,
		findNode:findNode,
		deleteNode:deleteNode,
		moveChild:moveChild
	}
}())