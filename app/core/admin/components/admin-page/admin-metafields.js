﻿/*
*   This page loads the metafields (entities and properties). 
*/

var admin_metafields = ['$scope', '$routeParams','GridService', 'ProjectService', 'DatasetService', 'CommonService', 'UserService',
    '$rootScope', '$uibModal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, GridService, ProjectService, DatasetService, CommonService, UserService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
		
        scope.entities = CommonService.getMetadataEntities();

        scope.entities.$promise.then(function () { 
            scope.selectedEntity = scope.entities[0];
            scope.activateDataGrid();
        });

        scope.showEntityProperties = function (entity) {
            scope.selectedEntity = entity;
            scope.dataGridOptions.api.setRowData(scope.selectedEntity.Properties);
        };

        var EditLinkTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openEditModal(param.data);
            });
            div.appendChild(editBtn);
            
            return div;
        };

        scope.dataGridOptions = {
            //data: 'datasets',
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            columnDefs: [
                { field: 'EditLink', headerName: '', cellRenderer: EditLinkTemplate, width: 50, menuTabs: []},
                { field: 'Name', headerName: 'Name', width: 180, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Description', headerName: 'Description', cellStyle: { 'white-space': 'normal' }, width: 300, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'DataType', headerName: 'DataType', width: 100, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'ControlType', headerName: 'Control Type', width: 100, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'PossibleValues', headerName: 'Possible Values', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
            ],
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                scope.dataGridOptions.selectedItems = scope.dataGridOptions.api.getSelectedRows();
                scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            selectedItems: []
        };

        scope.activateDataGrid = function () {

            var ag_grid_div = document.querySelector('#properties-grid');    //get the container id...
            scope.datatab_ag_grid = new agGrid.Grid(ag_grid_div, scope.dataGridOptions); //bind the grid to it.
            scope.dataGridOptions.api.showLoadingOverlay(); //show loading...
            scope.dataGridOptions.api.setRowData(scope.selectedEntity.Properties);           
        };

        scope.openEditModal = function (a_selection) {
            scope.SaveMessage = null;
            scope.field_to_edit = angular.copy(a_selection);
            scope.field_to_edit.MetadataEntityId = scope.selectedEntity.Id;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/modal-edit-metadataproperty.html',
                controller: 'ModalEditMetadataPropertyCtrl',
                scope: scope, //very important to pass the scope along...
            }).result.then(function (saved) { 
                //replace that location in the grid with the one we got back
                var found = false;
                scope.selectedEntity.Properties.forEach(function (existing, index) {
                    if (existing.Id == saved.Id) {
                        console.dir("found field to replace : " + existing.Id);
                        scope.selectedEntity.Properties[index] = saved;
                        found = true;
                    }
                });
                
                if (!found)
                    scope.selectedEntity.Properties.push(saved);

                scope.dataGridOptions.api.setRowData(scope.selectedEntity.Properties);
                scope.SaveMessage = "Success.";
            });
        };
        

        scope.addProperty = function () { 
            scope.openEditModal({});
        }

        scope.deleteProperty = function () { 
            scope.dataGridOptions.selectedItems.forEach(function (property) { 
                var delete_prop = CommonService.deleteMetadataProperty(property);
                delete_prop.$promise.then(function () { 
                    scope.selectedEntity.Properties.forEach(function (existing, index) {
                        if (existing.Id == property.Id) {
                            console.dir("found field to remove : " + existing.Id);
                            scope.selectedEntity.Properties.splice(index);
                            scope.dataGridOptions.api.setRowData(scope.selectedEntity.Properties);
                        }
                    });
                }, function () { 
                    console.log("something went wrong");
                });
            });

        };



/*
		scope.datasets = ProjectService.getProjectDatasets(routeParams.Id);
        scope.project = ProjectService.getProject(routeParams.Id);
        scope.locationDataset = DatasetService.getDataset(SYSTEM_LOCATION_DATASET); //load the dataset with the fields for location grid

        scope.selectedDataset = null;

		scope.AuthorizedToViewProject = true;

		//once the datasets load, make sure each is configured with our scope.
        scope.datasets.$promise.then(function () {
         	if ((scope.datasets) && (scope.datasets.length > 0)) {
				for (var i = 0; i < scope.datasets.length; i++)	{
					DatasetService.configureDataset(scope.datasets[i], scope);  // We must pass the scope along on this call.
				}
			} else {
				console.warn("This project has no datasets.");
            }
        });

        scope.locationDataset.$promise.then(function () { 
            scope.dataGridOptions.columnDefs = GridService.getAgColumnDefs(scope.locationDataset).HeaderFields;
            scope.dataGridOptions.columnDefs.unshift({ field: 'EditLink', headerName: '', cellRenderer: EditLinkTemplate, width: 50, alwaysShowField: true, menuTabs: [], hide: true }),
            scope.activateDataGrid();
        });

        scope.showLocations = function (dataset) { 
            
            scope.selectedDataset = dataset;

            var filter_component = scope.dataGridOptions.api.getFilterInstance('LocationTypeId');
            filter_component.selectNothing();
            filter_component.selectValue(dataset.Datastore.LocationTypeId);
            scope.dataGridOptions.api.onFilterChanged();
            scope.dataGridOptions.api.deselectAll();
            
        };

        scope.showProjectLocations = function () { 
            scope.selectedDataset = null;
            scope.dataGridOptions.api.setFilterModel(null)
            scope.dataGridOptions.api.onFilterChanged();
            scope.dataGridOptions.api.deselectAll();
        };

        
        var EditLinkTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openEditModal(param.data);
            });
            div.appendChild(editBtn);
            
            return div;
        };

        //datasets tab grid
        scope.dataGridOptions = {
            //data: 'datasets',
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            columnDefs: [],
            rowSelection: 'multiple',
            onSelectionChanged: function (params) {
                scope.dataGridOptions.selectedItems = scope.dataGridOptions.api.getSelectedRows();
                scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            selectedItems: []
        };

        scope.activateDataGrid = function () {

            var ag_grid_div = document.querySelector('#locations-grid');    //get the container id...
            scope.datatab_ag_grid = new agGrid.Grid(ag_grid_div, scope.dataGridOptions); //bind the grid to it.
            scope.dataGridOptions.api.showLoadingOverlay(); //show loading...

            scope.project.$promise.then(function () { 
                scope.dataGridOptions.api.setRowData(scope.project.Locations);
                if ($rootScope.Profile.canEdit(scope.project)) {
                    scope.dataGridOptions.columnApi.setColumnVisible("EditLink", true);
                    scope.dataGridOptions.api.refreshHeader();
                }
            });

        };

        scope.openEditModal = function (a_selection) {
            scope.SaveMessage = null;
            scope.row = angular.copy(a_selection);

            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-location.html',
                controller: 'ModalEditLocationCtrl',
                scope: scope, //very important to pass the scope along...
            }).result.then(function (saved_location) { 
                //replace that location in the grid with the one we got back
                scope.project.Locations.forEach(function (existing_location, index) {
                    if (existing_location.Id == saved_location.Id) {
                        console.dir("found field to replace : " + existing_location.Id);
                        scope.project.Locations[index] = saved_location;
                    }
                });
                
                scope.dataGridOptions.api.setRowData(scope.project.Locations);
                scope.SaveMessage = "Success.";
                scope.showProjectLocations();
    
            });
        };


        scope.addLocation = function (a_selection) {
            scope.SaveMessage = null;
            scope.row = { 'Status': 0 };

            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-location.html',
                controller: 'ModalEditLocationCtrl',
                scope: scope, //very important to pass the scope along...
            }).result.then(function (saved_location) { 
                //add that location in the grid with the one we got back
                scope.project.Locations.push(saved_location);

                scope.dataGridOptions.api.setRowData(scope.project.Locations);
                scope.SaveMessage = "Success.";
                scope.showProjectLocations();
            });
        };


        scope.deleteLocations = function () { 
            scope.dataGridOptions.selectedItems.forEach(function (location) { 
                var delete_loc = CommonService.deleteLocation(location.Id);
                delete_loc.$promise.then(function () { 
                    scope.project.Locations.forEach(function (existing_location, index) {
                        if (existing_location.Id == location.Id) {
                            console.dir("found field to remove : " + existing_location.Id);
                            scope.project.Locations.splice(index);
                            scope.dataGridOptions.api.setRowData(scope.project.Locations);
                            scope.showProjectLocations();
                        }
                    });
                }, function () { 
                    alert("Could not delete " + location.Label + " because activities exist. Remove them and then you can delete this location.");
                });
            });

        };

        //scope.map = common_module.getLocationMapLayer();
*/
    }

];






