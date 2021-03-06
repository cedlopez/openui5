/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.plugin.ControlDragDrop.
sap.ui.define([
	'sap/ui/dt/plugin/DragDrop',
	'sap/ui/dt/plugin/ElementMover',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/DOMUtil'
],
function(DragDrop, ElementMover, ElementUtil, DOMUtil) {
	"use strict";

	/**
	 * Constructor for a new ControlDragDrop.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ControlDragDrop enables D&D functionallity for the overlays based on aggregation types
	 * @extends sap.ui.dt.plugin.DragDrop"
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.plugin.ControlDragDrop
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ControlDragDrop = DragDrop.extend("sap.ui.dt.plugin.ControlDragDrop", /** @lends sap.ui.dt.plugin.ControlDragDrop.prototype */ {		
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				draggableTypes : {
					type : "string[]",
					defaultValue : ["sap.ui.core.Element"]
				},
				elementMover : {
					type : "sap.ui.dt.plugin.ElementMover",
					defaultValue : sap.ui.dt.plugin.ElementMover.Default
				}
			},
			associations : {
			},
			events : {
			}
		}
	});

	/**
	 * @override
	 */
	ControlDragDrop.prototype.setDraggableTypes = function(aDraggableTypes) {
		this.getElementMover().setMovableTypes(aDraggableTypes);
		return this.setProperty("draggableTypes", aDraggableTypes);
	};
	
	/**
	 * @override
	 */
	ControlDragDrop.prototype.registerOverlay = function(oOverlay) {
		DragDrop.prototype.registerOverlay.apply(this, arguments);
		var oElement = oOverlay.getElementInstance();
		if (this.getElementMover().isMovableType(oElement) && this.getElementMover().checkMovable(oOverlay)) {
			oOverlay.setMovable(true);
		}

		if (this.oDraggedElement) {
			this.getElementMover().activateTargetZonesFor(oOverlay);
		}
	};
	
	/**
	 * @override
	 */
	ControlDragDrop.prototype.deregisterOverlay = function(oOverlay) {
		DragDrop.prototype.deregisterOverlay.apply(this, arguments);
		oOverlay.setMovable(false);

		if (this.oDraggedElement) {
			this.getElementMover().deactivateTargetZonesFor(oOverlay);
		}
	};
	
	/**
	 * returns the dragged overlay (only during drag&drop)
	 * @public
	 * @return {sap.ui.dt.Overlay} overlays which is dragged
	 */
	ControlDragDrop.prototype.getDraggedOverlay = function() {
		return this._oDraggedOverlay;
	};
	
	/**
	 * @override
	 */
	ControlDragDrop.prototype.onDragStart = function(oOverlay, oEvent) {
		this._oDraggedOverlay = oOverlay;
		this.getElementMover().setMovedOverlay(oOverlay);
		
		this.getElementMover().activateAllValidTargetZones(this.getDesignTime());
	};

	/**
	 * @override
	 */
	ControlDragDrop.prototype.onDragEnd = function(oOverlay) {
		delete this._oPreviousTarget;

		this.getElementMover().deactivateAllTargetZones(this.getDesignTime());
		
		delete this._oDraggedOverlay;
		this.getElementMover().setMovedOverlay(null);
	};

	/**
	 * @override
	 */
	ControlDragDrop.prototype.onDragEnter = function(oTargetOverlay, oEvent) {
		var oDraggedOverlay = this.getDraggedOverlay();
		if (oTargetOverlay.getElementInstance() !== oDraggedOverlay.getElementInstance() && oTargetOverlay !== this._oPreviousTarget) {
			this.getElementMover().repositionOn(oDraggedOverlay, oTargetOverlay);
		}
		this._oPreviousTarget = oTargetOverlay;
	};

	/**
	 * @override
	 */
	ControlDragDrop.prototype.onAggregationDragEnter = function(oAggregationOverlay) {
		delete this._oPreviousTarget;

		var oTargetParentElement = oAggregationOverlay.getElementInstance();

		var oDraggedElement = this.getDraggedOverlay().getElementInstance();
		var oSourceParentOverlay = this.getDraggedOverlay().getParentElementOverlay();
		var oSourceParentElement;
		if (oSourceParentOverlay) {
			oSourceParentElement = oSourceParentOverlay.getElementInstance();
		}

		if (oTargetParentElement !== oSourceParentElement) {
			var sAggregationName = oAggregationOverlay.getAggregationName();
			ElementUtil.addAggregation(oTargetParentElement, sAggregationName, oDraggedElement);
		}
	};

	return ControlDragDrop;
}, /* bExport= */ true);