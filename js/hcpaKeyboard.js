/* 
	HCPA - created by Lee Tobin (lee.tobin@ucdconnect.ie) 
	---
	All code by Lee Tobin - 2018
*/

/* global cpa, hcpa, untilElement, removeDomel, modal, getId  */

hcpa.keyboard = (function () {
	
	function keys(event) {
		
		if( event.key == 'Enter'){

			if(event.target.value) if(event.target.value.length<1) return; //empty string 
			
			if (event.target.parentElement.matches('.name')) {
				
				hcpa.data.findNode(untilElement(event.target,"li").id, hcpa.data.tree[0]).name =event.target.value
				hcpa.data.saveLS()
				untilElement(event.target,".name").innerHTML = event.target.value
				removeDomel(event.target.id)
			}

		}
		
		
		if( event.key == 'Delete'){
			
			if( document.querySelector('.selected') ) {
				
				let values = hcpa.data.findNode(document.querySelector('.selected').parentElement.id, hcpa.data.tree[0]).values
				hcpa.data.removeParentCAData(values)
				hcpa.data.deleteNode(document.querySelector('.selected').parentElement.id, hcpa.data.tree[0]) 
				hcpa.data.saveLS()
				hcpa.drawTree()
				
			}
		}
		
		if( event.key == 'Escape'){
			if(document.getElementById('hcpaTree').classList.contains('hidden'))  //only if CPA is showing
			if(document.getElementById('cpaContent')){
				document.getElementById('hcpaTree').classList.remove('hidden')
				document.getElementById('edit-panel').classList.remove('hidden')
				document.getElementById('cpaContent').classList.add('hidden')
				
				//update tree
				let upTree = cpa.data['settings'].node
				while((upTree = hcpa.data.updateParent(upTree)));
					
				hcpa.data.saveLS()
				hcpa.drawTree()
				
			}
		}
		
		
		if( event.key == 'Insert'){
			
			if( (hcpa.data.tree.length < 1) || (document.querySelector('.selected')) ) {
				

				document.getElementById('modalContent').innerHTML = `<h3> New node </h3> 
					<input class="dialogInput" type="text" data-parent="${event.target.parentElement.id}" 
						id="newItem" name="newItem" required minlength="3" maxlength="100" placeholder="Enter new value name" />
					<span class="js-modal-hide">Close</span>`
				
				modal(document.querySelector('.modal'),{
					'onShow':function(){document.getElementById('newItem').focus()},
					'onHide':function(e){

						if(!e.querySelector('#newItem').value) return;
						let newNode = {
							"name":e.querySelector('#newItem').value,
							"id":getId("node"),
							"values":[],
							"type":"",
							"caData": {},
							"children":[]
						}	

						if(document.querySelector('.selected')) hcpa.data.findNode(untilElement(document.querySelector('.selected'),"li").id, hcpa.data.tree[0] ).children.push(newNode) //child
						else hcpa.data.tree.push( newNode ) //root
						hcpa.drawTree()
						hcpa.data.saveLS()						
					}
				}).show()
				
			}
		}
	}
	
	function events() {
		// ----------------------------- UP
		document.addEventListener('keyup', keys, false)
	}
	return {
		events: events
	}
}())