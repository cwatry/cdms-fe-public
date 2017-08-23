//import-controllers
// ken burcham 2/2014
'use strict';

var mod_di = angular.module('DataImportControllers', ['ui.bootstrap']);


mod_di.controller("DatasetImportCtrl", ['$scope','$routeParams','DatastoreService','DataService','$location','$upload','ActivityParser','DataSheet','$rootScope',
		'Logger','$route','$modal','ChartService','ServiceUtilities',
    	function($scope, $routeParams, DatastoreService, DataService, $location, $upload, ActivityParser, DataSheet, $rootScope, Logger, $route, $modal, ChartService,
			ServiceUtilities) {
//    		$scope.QAActivityStatuses = QAActivityStatuses;
    	$scope.dataset = DataService.getDataset($routeParams.Id);
		
			if ((typeof $scope.activities !== 'undefined') && ($scope.activites !== null))
			{
				$scope.activities = null;
				console.log("Set $scope.activities to null for project page...");
			}
		
			$scope.mappedActivityFields = {};
			$scope.userId = $rootScope.Profile.Id;
			$scope.fields = { header: [], detail: [], relation: []}; 
			$scope.dataSheetDataset = [];
			$scope.showHeaderForm = false;
			$scope.row = {}; //header form values if used...
			$scope.selectedItems = [];

			$scope.HeaderColDefs = []; //inserted into grid if wide-sheet view
			$scope.DetailColDefs = []; //fields always present in the grid
			$scope.RowQAColDef = [];

			// Q:  Why are we loading the activities, on the import page?
			// A:  Is a user entering a set of duplicate records?  We need the dataset activities to answer that question.
			//$scope.existingActivitiesLoad = DataService.getActivities($routeParams.Id);
			//$scope.existingActivities = []; // These are for checking for duplicates.
			$scope.sortedLocations = [];
			$scope.datasetLocationType=0;
			$scope.datasetLocations = [[]];
			$scope.primaryProjectLocation = 0;

			$scope.fishermenOptions = $rootScope.fishermenOptions = null;
			
			$scope.ShowInstrument = false;
			
			$scope.subprojectList = null;

			$scope.ActivityFields = { QAComments: DEFAULT_IMPORT_QACOMMENT, ActivityDate: new Date() };

			$scope.UploadResults = {};
			$scope.UploadResults.errors = [];

			$scope.ignoreDuplicates = true;
			$scope.DuplicateRecordsBucket = [];
			
			$scope.mapping = {};
			//to be able to show only the invalid records.
			$scope.ValidRecordsBucket = [];
			$scope.TempRecordsBucket = [];
			
			//datasheet grid
			$scope.gridDatasheetOptions = {
				data: 'dataSheetDataset',
				enableCellSelection: true,
		        enableRowSelection: true,
		        multiSelect: true,
		        enableCellEdit: true,
		        columnDefs: 'datasheetColDefs',
		        enableColumnResize: true,
		        selectedItems: $scope.selectedItems

			};
			
			/*$scope.chartConfig = {
    			  title : 'Fish by Species x',
				  tooltips: true,
				  labels : false,
				  
				  legend: {
				    display: true,
				    position: 'right'
				  }
    		};*/
    		//$scope.chartData = {"series": [], "data":[{ "x": "Loading...", "y": [0],"tooltip": ""}]}; //default
			
			$scope.importing = false;
			$scope.UploadResults.showPreview = false;
			$scope.Logger = Logger;
			$scope.enablePreview = false;
			

			
            //config the fields for the preview datasheet - include mandatory location and activityDate fields
			//$scope.datasheetColDefs = DataSheet.getColDefs();
			DataSheet.initScope($scope);

			$scope.cellRowQATemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'RowQAStatusId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in RowQAStatuses"/>';

			// Original code
			/*$scope.mappableFields = [
				{
					Label: "[-- Do not map --]"
				},
				{
					Label: "[-- Activity Date --]"
				},
				{
					Label: "[-- Index Field --]"
				},
				{
					Label: "[-- QA Row Status Id --]"
				},

				
				//{
				//	Label: "[-- Location Id --]"
				//},
				
			];
			*/
			
			$scope.$watch('subprojectList.length', function(){
				if ($scope.subprojectList === null)
					return;
				else if ($scope.subprojectList.length === 0)
					return;
				
				console.log("Inside watch subprojectList.length...");
				
				//if ($scope.DatastoreTablePrefix === "Metrics")
				if (($scope.datasets[i].DatastoreTablePrefix === "Metrics") || 
					($scope.datasets[i].DatastoreTablePrefix === "Benthic") ||
					($scope.datasets[i].DatastoreTablePrefix === "Drift")
					)
				{
					console.log("$scope.subprojectList is next...");
					console.dir($scope.subprojectList);
					console.log("$scope.project.Locations is next...");
					console.dir($scope.project.Locations);
				
					angular.forEach($scope.subprojectList, function(subproject){
						angular.forEach($scope.project.Locations, function(location){
							//console.log("location.LocationTypeId = " +  location.LocationTypeId + ", subproject.LocationId = " + subproject.LocationId + ", location.Id = " + location.Id);
							if (subproject.LocationId === location.Id)
							{
								console.log("Found a subproject location")
								console.dir(location);
								$scope.datasetLocations.push([location.Id, location.Label]);
							}
						});						
					});
				}
				
				console.log("datasetLocations (with subprojects) is next...");
				console.dir($scope.datasetLocations);

				$scope.finishLocationProcessing();
			});

			/*$scope.$watch('dataset.Id', function(){
				if (!$scope.dataset.Id) return;
				
				console.log("Inside DatasetImportCtrl, dataset.Id watcher...");
				
				console.log("$scope.dataset is next...");
				console.dir($scope.dataset);
				
				$rootScope.datasetId = $scope.datasetId = $scope.dataset.Id;
				console.log("$rootScope.datasetId = " + $rootScope.datasetId);
				
				//if (($scope.dataset.Config !== "NULL") && ($scope.dataset.Config.DataEntryPage.ShowFields.contains('Instrument')))
				if (((typeof $scope.dataset.Config !== 'undefined') && 
					($scope.dataset.Config !== null) && 
					($scope.dataset.Config !== "NULL")) && 
					($scope.dataset.Config.DataEntryPage.HiddenFields) &&
					($scope.dataset.Config.DataEntryPage.HiddenFields.indexOf("Instrument") > -1))
						console.log("Found instrument");
				
				$scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = $scope.dataset.Datastore.TablePrefix;
				$scope.datasetLocationType = DatastoreService.getDatasetLocationType($scope.DatastoreTablePrefix);				
				console.log("LocationType = " + $scope.datasetLocationType);				
				$scope.datasheetColDefs = DataSheet.getColDefs($scope.DatastoreTablePrefix);  // Pass the TablePrefix (name of the dataset), because it will never change.
				$scope.mappableFields = $scope.setMappableFields($scope.DatastoreTablePrefix);				
			});
			*/
			
			//setup our mappableFields list
    		//$scope.$watch('dataset.Name', function(){
    		$scope.$watch('dataset.Fields', function(){
				if (!$scope.dataset.Fields)
					return;

				console.log("Inside DatasetImportCtrl, dataset.Fields watcher...");
				
				console.log("$scope.dataset is next...");
				console.dir($scope.dataset);
				
				$rootScope.datasetId = $scope.datasetId = $scope.dataset.Id;
				console.log("$rootScope.datasetId = " + $rootScope.datasetId);
				
				//if (($scope.dataset.Config !== "NULL") && ($scope.dataset.Config.DataEntryPage.ShowFields.contains('Instrument')))
				if (((typeof $scope.dataset.Config !== 'undefined') && 
					($scope.dataset.Config !== null) && 
					($scope.dataset.Config !== "NULL")) && 
					($scope.dataset.Config.DataEntryPage.HiddenFields) &&
					($scope.dataset.Config.DataEntryPage.HiddenFields.indexOf("Instrument") > -1))
						console.log("Found instrument");
				
				$scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = $scope.dataset.Datastore.TablePrefix;
				console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
				
				if ($scope.DatastoreTablePrefix === 'WaterTemp')
					$scope.ShowInstrument = true;
				else if ($scope.DatastoreTablePrefix === "CreelSurvey")
				{
					$scope.fishermenList = DatastoreService.getFishermen();
					$scope.datasheetColDefs2 = [ 
							{
								field: 'FishermanId',
								displayName: 'Fisherman',
								cellFilter: 'fishermanFilter',
							}
						];
				}
				
				$scope.datasetLocationType = DatastoreService.getDatasetLocationType($scope.DatastoreTablePrefix);				
				console.log("LocationType = " + $scope.datasetLocationType);	
				
				$scope.datasheetColDefs = DataSheet.getColDefs($scope.DatastoreTablePrefix);  // Pass the TablePrefix (name of the dataset), because it will never change.
				console.log("$scope.datasheetColDefs is next...");
				console.dir($scope.datasheetColDefs);
				
				$scope.mappableFields = $scope.setMappableFields($scope.DatastoreTablePrefix);
									
				//DataService.configureDataset($scope.dataset); //bump to load config since we are pulling it directly out of the activities

				$scope.project = DataService.getProject($scope.dataset.ProjectId);

				$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');
				$scope.RowQAStatuses =  $rootScope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  //Row qa status ids

				$scope.ActivityFields.QAStatusId = ""+$scope.dataset.DefaultActivityQAStatusId;

				//setup special columns so they participate in validation
				$scope.FieldLookup['activityDate'] = { DbColumnName: 'activityDate', ControlType: "date" };
				$scope.FieldLookup['QAStatusId'] = 	 { DbColumnName: 'QAStatusId', ControlType: "select" };
				$scope.CellOptions['QAStatusIdOptions'] = 	 $scope.QAStatusOptions;
				$scope.CellOptions['FishermanIdOptions'] = $scope.fishermenOptions;

				//iterate fields and set 'em up
				angular.forEach($scope.dataset.Fields.sort(orderByAlpha), function(field){
					parseField(field, $scope);

					//mappable fields
					$scope.mappableFields.push(field);

					//setup the headers/details and datasheet fields
					if(field.FieldRoleId == FIELD_ROLE_HEADER)
					{
						$scope.fields.header.push(field);
						$scope.HeaderColDefs.push(makeFieldColDef(field, $scope));
					}
					else if(field.FieldRoleId == FIELD_ROLE_DETAIL)
					{
						$scope.fields.detail.push(field);
						$scope.DetailColDefs.push(makeFieldColDef(field, $scope));
					}

					//convention: if you have a readingdatetime field then we turn on our timezone magic
					if(field.DbColumnName == "ReadingDateTime")
					{
						/* Note:  The first line below allows the system to automatically determine what timezone we are in, based upon the current date.
							Initially this seemed like a good idea.  However, while the WaterTemp folks collect their data during the Daylight Savings
							timezone, they upload their data during the Standard timezone.  When the system requires them to remember to change the timezone,
							for all their imports from Standard to Daylight Savings, it can cause a headache, if they forget to make the change.
							Therefore, we decided instead to default the timezone to Daylight Savings, and have them change it to Standard if they must.
							Changing to Standard is a less occurring event than changing from Standard to Daylight Savings.
						*/
						//$scope.row.Timezone = getByField($scope.SystemTimezones, new Date().getTimezoneOffset() * -60000, "TimezoneOffset"); //set default timezone
						$scope.row.Timezone = getByField($scope.SystemTimezones, 420 * -60000, "TimezoneOffset"); //set default timezone to Daylight Savings
					}

				});

				//set defaults for header fields
				angular.forEach($scope.fields.header, function(headerfield){
					$scope.row[headerfield.DbColumnName] = (headerfield.DefaultValue) ? headerfield.DefaultValue : null;
				});

				//if we have more than 1 row qa status then show them.
				//if($scope.dataset.RowQAStatuses.length > 1)
				if (($scope.dataset.Datastore.TablePrefix === "WaterTemp") && ($scope.dataset.RowQAStatuses.length > 1))
				{
					$scope.RowQAColDef.push(
					{
						field: "RowQAStatusId", //QARowStatus
						displayName: "Row QA",
						cellFilter: 'RowQAStatusFilter',
						enableCellEditOnFocus: true,
						editableCellTemplate: $scope.cellRowQATemplate
					});
				}

    		});
			
			$scope.$watch('project.Name', function(){
	        	if(!$scope.project) return;
				
				console.log("Inside DatasetImportCtrl, project.Name watcher...");
	        	//Logger.debug($scope.project);
				
				//$scope.subprojectType = DatastoreService.getProjectType($scope.project.Id);
				console.log("$scope.subprojectType = " + $scope.subprojectType);
				DataService.setServiceSubprojectType($scope.subprojectType);

				//if ($scope.subprojectType === "Habitat")
				if ($scope.DatastoreTablePrefix === "Metrics")
				{
					console.log("Loading Habitat subprojects...");				

					$scope.subprojectList = DataService.getProjectSubprojects($scope.project.Id);
					var watcher = $scope.$watch('subprojectList.length', function(){
						console.log("Inside watcher for subprojectList.length...");
						// We wait until subprojects gets loaded and then turn this watch off.
						if ($scope.subprojectList === null)
						{
							console.log("$scope.subprojectList is null");
							return;
						}
						else if (typeof $scope.subprojectList.length === 'undefined')
						{
							console.log("$scope.subprojectList.length is undefined.");
							return;
						}
						else if ($scope.subprojectList.length === 0)
						{
							console.log("$scope.subprojectList.length is 0");
							return;
						}
						console.log("$scope.subprojectList.length = " + $scope.subprojectList.length);
						console.log("subprojects is loaded...");
						console.dir($scope.subprojectList);
						
						watcher();
					});
				}

	        	//check authorization -- need to have project loaded before we can check project-level auth
				//if(!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project))
				if(!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project))
				{
					$location.path("/unauthorized");
				}
				else if ($rootScope.Profile.isProjectOwner($scope.project) && $rootScope.Profile.isProjectEditor($scope.project))
				{
					console.log("User is authorized.");
				}

				console.log("ProjectLocations is next...");
				console.dir($scope.project.Locations);
				//var locInd = 0;
				if ($scope.project.Locations)
				{
					for (var i = 0; i < $scope.project.Locations.length; i++ )
					{
						//console.log("projectLocations Index = " + $scope.project.Locations[i].Label);
						//console.log($scope.project.Locations[i].LocationTypeId + "  " + $scope.datasetLocationType); //$scope.project.Locations[i]);
						if (($scope.DatastoreTablePrefix === "Metrics") ||
							($scope.DatastoreTablePrefix === "Benthic") ||
							($scope.DatastoreTablePrefix === "Drift")
							)
						{
							if (($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType) || ($scope.project.Locations[i].LocationTypeId === LOCATION_TYPE_Hab))
							{
								//console.log("Found Habitat-related location");
								$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
							}
						}
						else
						{
							if ($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType)
							{
								//console.log("Found non-Habitat-related location");
								$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
							}
						}

						//{
						//	//console.log("Found one");
						//	$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
						//	//console.log("datasetLocations length = " + $scope.datasetLocations.length);
						//	//locInd++;
						//}
					}
					console.log("datasetLocations is next...");
					console.dir($scope.datasetLocations);
					
					$scope.finishLocationProcessing();
				}
				/*
				// When we built the array, it started adding at location 1 for some reason, skipping 0.
				// Therefore, row 0 is blank.  The simple solution is to just delete row 0.
				//$scope.datasetLocations.shift();
				
				// During the original development, the blank row was always at row 0.  Months later, I noticed that 
				// the blank row was not at row 0.  Therefore, it needed a different solution.
				var index = 0;
				angular.forEach($scope.datasetLocations, function(dsLoc)
				{
					if (dsLoc.length === 0)
					{
						$scope.datasetLocations.splice(index, 1);
					}
					
					index++;
				});
				
				console.log("datasetLocations after splice is next...");
				console.dir($scope.datasetLocations);

				$scope.datasetLocations.sort(order2dArrayByAlpha);
				console.log("datasetLocations sorted...");
				console.dir($scope.datasetLocations);

				// Convert our 2D array into an array of objects.
				for (var i = 0; i < $scope.datasetLocations.length; i++)
				{
					$scope.sortedLocations.push({Id: $scope.datasetLocations[i][0], Label: $scope.datasetLocations[i][1]});
				}
				$scope.datasetLocations = [[]]; // Clean up
				
				
				// Convert our array of objects into a list of objects, and put it in the select box.
				$scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.sortedLocations, 'Id','Label') ;

				console.log("locationOptions is next...");
				console.dir($scope.locationOptions);					
				
				//Add the OtherAgencyId to the label - requirement from Colette
				angular.forEach($scope.project.Locations, function(loc)
	    		{
	    			if(loc.OtherAgencyId && loc.Label.indexOf(loc.OtherAgencyId)==-1)
	    				loc.Label = loc.Label + ' (' + loc.OtherAgencyId + ')';
	    		});
				*/
	        	//setup locationOptions dropdown
				//$scope.locationOptions = $rootScope.locationOptions = makeObjects(getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId"), 'Id','Label') ;  // Original code
				$scope.instrumentOptions = $rootScope.instrumentOptions = makeObjects($scope.project.Instruments, 'Id','Name');
				
				//setup location field to participate in validation
				$scope.FieldLookup['locationId'] = { DbColumnName: 'locationId', ControlType: "select" };
				$scope.CellOptions['locationIdOptions'] = $scope.locationOptions;

				//set locationid if it is incoming as a query param (?LocationId=142)
	    		if($routeParams.LocationId)
				{
	    			$scope.ActivityFields.LocationId = $routeParams.LocationId;
	    			$scope.setLocation();
				}
	    		//single location?  go ahead and set it to the default.
	    		else if(array_count($scope.locationOptions) == 1)
				{
	    			angular.forEach(Object.keys($scope.locationOptions), function(key){
	    				$scope.ActivityFields.LocationId = key;
	    				$scope.setLocation();
	    			});
	    		}
				
				$scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects($scope.project.Fishermen, 'Id','FullName');
				console.log("Just set $scope.fishermenOptions...");
				console.dir($scope.fishermenOptions);

	        });

			//setup our existingActivities array so we can manage duplicates
	        /*var ealoadwatcher = $scope.$watch('existingActivitiesLoad.length', function(){
	        	if (($scope.existingActivitiesLoad) && ($scope.existingActivitiesLoad.length > 0))
	        	{
	        		$scope.existingActivitiesLoad.$promise.then(function(){
	        			angular.forEach($scope.existingActivitiesLoad, function(activity, key){
	        				$scope.existingActivities.push(activity.LocationId+"_"+activity.ActivityDate.substr(0,10));
	        			});
	        			$scope.existingActivitiesLoad = []; // cleanup
	        			//console.dir($scope.existingActivities);
	        			ealoadwatcher();
	        		});
	        	}

	        });
			*/
			
    		//$scope.$watch('UploadResults.activities', function(){
    		//	$scope.activity_count = array_count($scope.UploadResults.activities.activities);
    		//});

    		//set mapping fields to defaults
			$scope.$watch('fileFields', function(){
				if(Array.isArray($scope.fileFields))
				{
					if($scope.fileFields.length == 0)
					{
						$scope.uploadErrorMessage="No columns headers were found in the file. Please make sure the column headers are in the first row of your file and try again.";
						$scope.fileFields = undefined;
					}
					//TODO: get map candidates from the server. for now, if the field name matches a mappable field, set it, otherwise set to do not map.
					//TODO: refactor this to not have to spin so many times... but not a big deal i guess. ;)
					angular.forEach($scope.fileFields, function(field_in){
						var field_in_compare = field_in.toUpperCase();
						for (var i = $scope.mappableFields.length - 1; i >= 0; i--) {

							//Logger.debug("Comparing: " + $scope.mappableFields[i].Label.toUpperCase() + " and " + field_in_compare);

							if($scope.mappableFields[i].Label.toUpperCase() === field_in_compare)
							{
								$scope.mapping[field_in] = $scope.mappableFields[i];
								return;
							}
						};

						//only reaches here if we didn't find a label match
						$scope.mapping[field_in] = $scope.mappableFields[DO_NOT_MAP];

					});
				}
			});
			
			$scope.finishLocationProcessing = function(){
				console.log("Inside $scope.finishLocationProcessing...");
				// When we built the array, it started adding at location 1 for some reason, skipping 0.
				// Therefore, row 0 is blank.  The simple solution is to just delete row 0.
				//$scope.datasetLocations.shift();
				
				// During the original development, the blank row was always at row 0.  Months later, I noticed that 
				// the blank row was not at row 0.  Therefore, it needed a different solution.
				var index = 0;
				angular.forEach($scope.datasetLocations, function(dsLoc)
				{
					if (dsLoc.length === 0)
					{
						$scope.datasetLocations.splice(index, 1);
					}
					
					index++;
				});
				
				console.log("datasetLocations after splice is next...");
				console.dir($scope.datasetLocations);	

				$scope.datasetLocations.sort(order2dArrayByAlpha);
				console.log("datasetLocations sorted...");
				console.dir($scope.datasetLocations);

				// Convert our 2D array into an array of objects.
				for (var i = 0; i < $scope.datasetLocations.length; i++)
				{
					$scope.sortedLocations.push({Id: $scope.datasetLocations[i][0], Label: $scope.datasetLocations[i][1]});
				}		
				$scope.datasetLocations = [[]]; // Clean up
				
				
				// Convert our array of objects into a list of objects, and put it in the select box.
				$scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.sortedLocations, 'Id','Label') ;

				console.log("locationOptions is next...");
				console.dir($scope.locationOptions);

				//if there is only one location, just set it to that location
				if(array_count($scope.locationOptions)==1)
				{
					//there will only be one.
					angular.forEach(Object.keys($scope.locationOptions), function(key){
						console.log(key);
						$scope.row['locationId'] = key;	
					});
					
				}

				//Add the OtherAgencyId to the label - requirement from Colette
				angular.forEach($scope.project.Locations, function(loc)
	    		{
	    			if(loc.OtherAgencyId && loc.Label.indexOf(loc.OtherAgencyId)==-1)
	    				loc.Label = loc.Label + ' (' + loc.OtherAgencyId + ')';
	    		});

				console.log("$scope (at the end of $scope.finishLocationProcessing) is next...");
				console.dir($scope);
			};	
			
			$scope.setMappableFields = function()
			{
				console.log("Inside $scope.setMappableFields...");
				var mappableFields = [];
				console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
				if ($scope.DatastoreTablePrefix === "CreelSurvey")
				{
					console.log("Setting for CreelSurvey...");
					mappableFields.push({ Label: "[-- Do not map --]" });
					mappableFields.push({ Label: "[-- Activity Date --]" });					
					mappableFields.push({ Label: "[-- Location Id --]" });
					mappableFields.push({ Label: "[-- Fisherman --]" });
				}
				else if ($scope.DatastoreTablePrefix === "Benthic")
				{
					console.log("Setting for CreelSurvey...");
					mappableFields.push({ Label: "[-- Do not map --]" });
					mappableFields.push({ Label: "[-- Activity Date --]" });					
					mappableFields.push({ Label: "[-- Location Id --]" });
				}
				else
				{
					console.log("Setting for non-CreelSurvey...");
					mappableFields.push({ Label: "[-- Do not map --]" });
					mappableFields.push({ Label: "[-- Activity Date --]" });					
					mappableFields.push({ Label: "[-- Index Field --]" });
					mappableFields.push({ Label: "[-- QA Row Status Id --]" });
				}
				return mappableFields;
			};

			$scope.setLocation = function()
			{
				$scope.ActivityFields.Location = getByField($scope.project.Locations, $scope.ActivityFields.LocationId, "Id");
			};

			$scope.reloadProject = function(){
                //reload project instruments -- this will reload the instruments, too
                DataService.clearProject();
                $scope.project = DataService.getProject($scope.dataset.ProjectId);
                var watcher = $scope.$watch('project.Id', function(){
                	$scope.selectInstrument();
                	watcher();
                });

	         };

			$scope.clearSelections = function()
			{
				$scope.gridDatasheetOptions.selectAll(false);
			};

			$scope.setSelectedBulkQAStatus = function(rowQAId)
			{
				angular.forEach($scope.gridDatasheetOptions.selectedItems, function(item, key){
					//console.dir(item);
					item.RowQAStatusId = rowQAId;
				});

				$scope.clearSelections();
			};

			$scope.createInstrument = function(){
	            $scope.viewInstrument = null;
	            var modalInstance = $modal.open({
	              templateUrl: 'partials/instruments/modal-create-instrument.html',
	              controller: 'ModalCreateInstrumentCtrl',
	              scope: $scope, //very important to pass the scope along...
	            });
	         };

			$scope.openBulkQAChange = function(){
	            var modalInstance = $modal.open({
	              templateUrl: 'partials/dataentry/modal-rowqaupdate.html',
	              controller: 'ModalBulkRowQAChangeCtrl',
	              scope: $scope, //very important to pass the scope along...

	            });

			};

			$scope.openAccuracyCheckModal = function(){

	            var modalInstance = $modal.open({
	              templateUrl: 'partials/instruments/modal-new-accuracycheck.html',
	              controller: 'ModalQuickAddAccuracyCheckCtrl',
	              scope: $scope, //very important to pass the scope along...

	            });

			};

			$scope.getDataGrade = function(check){ return getDataGrade(check)}; //alias from service

			$scope.selectInstrument = function(){
				//get latest accuracy check
				$scope.viewInstrument = getByField($scope.project.Instruments, $scope.ActivityFields.InstrumentId, "Id");
				
				// If the page is refreshed and the cache is flushed, $scope.viewInstrument is null at first.
				if ((typeof $scope.viewInstrument !== 'undefined') && ($scope.viewInstrument !== null))				
				{
					if($scope.viewInstrument && $scope.viewInstrument.AccuracyChecks.length > 0)
						$scope.row.AccuracyCheckId = $scope.viewInstrument.AccuracyChecks[$scope.viewInstrument.AccuracyChecks.length-1].Id; //set to last one
				}
			};

			$scope.toggleDuplicates = function(){

				try{
					if(!$scope.ignoreDuplicates)
					{
						$scope.TempRecordsBucket = [];
						$scope.DuplicateRecordsBucket = [];
						angular.forEach($scope.dataSheetDataset, function(item, key){
							var date_check = item.activityDate;

							if(typeof item.activityDate == "object")
								date_check = item.activityDate.toISOString();

							if($scope.existingActivities.indexOf(item.locationId + "_"+date_check.substr(0,10)) != -1) //found a duplicate
								$scope.DuplicateRecordsBucket.push(item);
							else
								$scope.TempRecordsBucket.push(item);
						});

						$scope.dataSheetDataset = $scope.TempRecordsBucket;
						$scope.TempRecordsBucket = [];
						//our duplicates are in $scope.DuplicateRecordsBucket
					}
					else
					{
						angular.forEach($scope.DuplicateRecordsBucket, function(item, key){
							$scope.dataSheetDataset.push(item);
						});
						$scope.DuplicateRecordsBucket = [];
					}

					$scope.validateGrid($scope);
		        	$scope.floatErrorsToTop();
		        }
		        catch(e)
		        {
		        	console.dir(e);
		        }

			};

			$scope.floatErrorsToTop = function(){
				//iterate and split errors from valid records.
				angular.forEach($scope.dataSheetDataset, function(row, key){
					if(row.isValid)
					{
						$scope.ValidRecordsBucket.push(row);
					}
					else
					{
						$scope.TempRecordsBucket.push(row);
					}
				});

				//set the grid to be just the errors.
				$scope.dataSheetDataset = $scope.TempRecordsBucket;
				$scope.TempRecordsBucket = [];

				//bring all the valid records back in below the errors
				angular.forEach($scope.ValidRecordsBucket, function(row, key){
					$scope.dataSheetDataset.push(row);
				});
				$scope.ValidRecordsBucket = [];

			};
			
			//control disabling and re-enabling special fields
			// On the Import form, Step 2, when the user maps Activity Date, or one of the other special fields,
			// it calls this function.
			$scope.updateSpecialFields = function(field_name){
				console.log("Inside $scope.updateSpecialFields...");
				console.log("$scope is next...");
				console.dir($scope);
				//console.log("Picked and mapped " + field_name);
				//angular.forEach($scope.mappableFields, function(mappableField){
				//	console.log("mappableField.Label = " + mappableField.Label);
				//});
				//angular.forEach($scope.mappedActivityFields, function(mappedField){
				//	console.log("mappedField.Label = " + mappedField.Label);
				//});

				//this is pretty ripe for refactoring.
				if ($scope.DatastoreTablePrefix === "CreelSurvey")
				{
					if($scope.mapping[field_name])
					{
						// The variables in all caps in this section are set in the config.js file.
						// If you map Activity Date to something besides Activity Date on the list, it will not pass this check.
						if($scope.mapping[field_name].Label === $scope.mappableFields[ACTIVITY_DATE].Label)
						{
							$scope.mappedActivityFields[ACTIVITY_DATE] = field_name;
							console.log("Found and mapped ACTIVITY_DATE");
						}
						
						else if($scope.mapping[field_name].Label === $scope.mappableFields[LOCATION_ID].Label)
						{
							$scope.mappedActivityFields[LOCATION_ID] = field_name;
							console.log("Found and mapped LOCATION_ID");
						}
						
						else if($scope.mapping[field_name].Label === $scope.mappableFields[FISHERMAN].Label)
						{
							$scope.mappedActivityFields[FISHERMAN] = field_name;
							console.log("Found and mapped FISHERMAN");
						}
						
						else
						{
							//undisable corresponding special field if this had been one
							if($scope.mappedActivityFields[ACTIVITY_DATE] === field_name)
								$scope.mappedActivityFields[ACTIVITY_DATE] = false;

							if($scope.mappedActivityFields[INDEX_FIELD] === field_name)
								$scope.mappedActivityFields[INDEX_FIELD] = false;

						/*
							if($scope.mappedActivityFields[LOCATION_ID] === field_name)
								$scope.mappedActivityFields[LOCATION_ID] = false;
							*/
							if($scope.mappedActivityFields[ROW_QA_STATUS_ID] === field_name)
								$scope.mappedActivityFields[ROW_QA_STATUS_ID] = false;
							
						}
					}
				}
				else
				{
					if($scope.mapping[field_name])
					{
						// The variables in all caps in this section are set in the config.js file.
						// If you map Activity Date to something besides Activity Date on the list, it will not pass this check.
						if($scope.mapping[field_name].Label === $scope.mappableFields[ACTIVITY_DATE].Label)
						{
							$scope.mappedActivityFields[ACTIVITY_DATE] = field_name;
							console.log("Found and mapped ACTIVITY_DATE");
						}

						else if($scope.mapping[field_name].Label === $scope.mappableFields[INDEX_FIELD].Label)
						{
							$scope.mappedActivityFields[INDEX_FIELD] = field_name;
							console.log("Found and mapped INDEX_FIELD");
						}
						
						else if($scope.mapping[field_name].Label === $scope.mappableFields[ROW_QA_STATUS_ID].Label)
						{
							$scope.mappedActivityFields[ROW_QA_STATUS_ID] = field_name;
							console.log("Found and mapped ROW_QA_STATUS_ID");
						}
						
						else
						{
							//undisable corresponding special field if this had been one
							if($scope.mappedActivityFields[ACTIVITY_DATE] === field_name)
								$scope.mappedActivityFields[ACTIVITY_DATE] = false;

							if($scope.mappedActivityFields[INDEX_FIELD] === field_name)
								$scope.mappedActivityFields[INDEX_FIELD] = false;

						/*
							if($scope.mappedActivityFields[LOCATION_ID] === field_name)
								$scope.mappedActivityFields[LOCATION_ID] = false;
							*/
							if($scope.mappedActivityFields[ROW_QA_STATUS_ID] === field_name)
								$scope.mappedActivityFields[ROW_QA_STATUS_ID] = false;
							
						}

					}
				}
				console.log("$scope at end of updateSpecialFields is next...");
				console.dir($scope);
			};

			$scope.previewUpload = function()
			{
				console.log("Inside previewUpload...");
				
				$scope.errors = [];
				$scope.enablePreview = false;
				$scope.importing = true;
				console.log("Set $scope.importing = true...");
				
				//console.log("$scope in previewUpload is next...");
				//console.dir($scope);

				/****************************************************/
				/* 	This section needs a review.
					The Creel Survey dataset file will have multiple locations, possibly one on each row.
					With WaterTemp, the user could upload their audits (Field, Retrieval, Launch) on one sheet,
					and each is a different activity.
					Currently, the import expects something like a logger, where all the data is on one activity.
				*/
				//validate mapping fields -- primarily: make sure there are selections for special fields
				
				// Note:  $scope.ActivityFields.LocationId is the Location is Step 3 on the Import form.
				//if(!$scope.ActivityFields.LocationId)
				if ($scope.DatastoreTablePrefix === "CreelSurvey")
				{
					if ((!$scope.ActivityFields.LocationId) && (!$scope.mappedActivityFields[LOCATION_ID]))
					{
						$scope.errors.push("Please select an activity location.");
					}
				}
				else
				{
					if (!$scope.ActivityFields.LocationId)
					{
						$scope.errors.push("Please select an activity location.");
					}
				}
				/***************************************************/
				
				//console.log("$scope.ActivityFields.ActivityDate (before check) = " + $scope.ActivityFields.ActivityDate);
				console.log("$scope.mappedActivityFields[ACTIVITY_DATE] = " + $scope.mappedActivityFields[ACTIVITY_DATE]);
				if($scope.mappedActivityFields[ACTIVITY_DATE])
					$scope.ActivityFields.ActivityDate = $scope.mappedActivityFields[ACTIVITY_DATE];

				if(!$scope.ActivityFields.ActivityDate)
				{
					$scope.errors.push("Please select an activity date or map a date source field.");
				}

				if(!$scope.ActivityFields.QAStatusId)
				{
					$scope.errors.push("Please select an activity QA Status.");
				}

				console.log("$scope.errors.length = " + $scope.errors.length);
				if($scope.errors.length == 0)
				{
					//execute upload
					Logger.debug("displaying preview...");
					console.log("$scope.datasheetColDefs (inside $scope.previewUpload) is next...");
					console.dir($scope.datasheetColDefs);
					$scope.displayImportPreview();
				}else{
					$scope.uploadErrorMessage = "";
					angular.forEach($scope.errors, function(anError){
						$scope.uploadErrorMessage += anError + "  ";
					});
					
					console.log("Doing nothing since there are errors");
					$scope.enablePreview = true;
				}
				
				//$scope.importing = false;
			}

			//iterates the import data rows according to mappings and copies into the grid datasheet
			$scope.displayImportPreview = function()
			{
				console.log("Inside displayImportPreview");
				console.log("$scope is next...");
				console.dir($scope);
				console.log("$scope.datasheetColDefs is next...");
				console.dir($scope.datasheetColDefs);
				console.log("$scope.RowQAColDef is next...");
				console.dir($scope.RowQAColDef);
				
				//decide if we are going to show the headerForm.  we DO if they entered an activity date, DO NOT if they mapped it.
				if($scope.mappedActivityFields[ACTIVITY_DATE] || $scope.mappedActivityFields[INDEX_FIELD])
				{
					$scope.showHeaderForm = false; //because we have mapped the activity date field to our datafile, meaning multiple activity dates needs the wide sheet.
					$scope.datasheetColDefs = $scope.RowQAColDef.concat($scope.datasheetColDefs,$scope.HeaderColDefs, $scope.DetailColDefs);
				}
				else
				{
					$scope.showHeaderForm = true; //single activity, use the headerform.
					//$scope.datasheetColDefs = $scope.RowQAColDef.concat($scope.DetailColDefs);
					$scope.datasheetColDefs = $scope.RowQAColDef.concat($scope.datasheetColDefs2,$scope.DetailColDefs);
				}

				console.log("$scope.datasheetColDefs (after concatentation) is next...");  // Note:  Column ReleaseLocation is already present here, col 9.
				console.dir($scope.datasheetColDefs);

				$scope.recalculateGridWidth($scope.datasheetColDefs.length);
				
				// We use this flag, to mark our progress through the imported data.
				// If we are using the header form, we get the header info from the first row.  After that, we ignore the header fields.
				//var loadHeader = true;  // Do we still need this?
				var activityDateType = "";
				
				//console.log("About to loop through $scope.UploadResults.Data.rows, data_row");
				angular.forEach($scope.UploadResults.Data.rows, function(data_row){
					//console.log("*data_row is next...");
					//console.dir(data_row);
					try
					{

						//set default Row QA StatusId
						//if (($scope.dataset.Datastore.TablePrefix === "WaterTemp") && ($scope.dataset.RowQAStatuses.length > 1))
							var new_row = {
								RowQAStatusId: $scope.dataset.DefaultRowQAStatusId
							};

						// Start Activities fields********************************************************
						// ActivityFields first.  These come from the import form.
						//console.log($scope.mapping[$scope.ActivityFields.LocationId]);

						if($scope.mapping[$scope.ActivityFields.LocationId])
							new_row.locationId = data_row[$scope.ActivityFields.LocationId];
						else
							new_row.locationId = $scope.ActivityFields.LocationId;
						
						if ($scope.ActivityFields.InstrumentId)
							new_row.InstrumentId = $scope.ActivityFields.InstrumentId;


						if($scope.mapping[$scope.ActivityFields.ActivityDate])
							new_row.activityDate = data_row[$scope.ActivityFields.ActivityDate];
						else
							new_row.activityDate = $scope.ActivityFields.ActivityDate;
						
						if($scope.mapping[$scope.ActivityFields.QAStatusId])
							new_row.QAStatusId = data_row[$scope.ActivityFields.QAStatusId];
						else
							new_row.QAStatusId = $scope.ActivityFields.QAStatusId;

						if($scope.mappedActivityFields[INDEX_FIELD])
							new_row.activityIndex = data_row[$scope.mappedActivityFields[INDEX_FIELD]];

						// End Activities fields*********************************************************
						
						
						// Start data rows***************************************************************
						// Next, we load the fields that come from the imported data.
						// Note:  $scope.row is for the header, $scope.dataSheetDataset is for the details.
						//console.log("data_row is next...");
						//console.dir(data_row);

						// On each row of imported data (data_row), we only want to pull in the fields we have mapped.
						// Therefore, we loop through $scope.mapping, which contains those fields.
						//console.log("About to loop through $scope.mapping, field & col, checking mapped fields...");
						angular.forEach($scope.mapping, function(field, col){
							// If we DID NOT map a field to Activity Date, we need headers.
							// We get the headers from the first row.
							//console.log("field is next...");
							//console.dir(field);
							// field is the column, and col is actually the value.
							//console.log("field.DbColumnName = " + field.DbColumnName + ", field.Label = " + field.Label + ", col = " + col);
							//console.log("**data_row[col] = " + data_row[col] + ", typeof = " + typeof data_row[col]);
							
							try{
								//console.log("field/col are next...");
								//console.dir(field);
								//console.log(col);
								// Did the user map the field to something in the database?
								// On the form, if the user mapped the Activity date in Step 2, rather than setting it in Step 3,
								// then we get the Activity date from the first row.
								if(field.Label != $scope.mappableFields[DO_NOT_MAP])
								{
									// Also check if the field is a header or detail; header->row, detail->dataSheetDataset
									
									//just ditch if it is an empty value
									if(data_row[col] === null || data_row[col] === "")
									{
										return; // This just pops us out of this iteration early.
									}
									
									if ($scope.DatastoreTablePrefix === "CreelSurvey")
									{
										// Guess what?  If the value is 0, on Test CDMS treats it as an empty value.  We have to handle that...
										if ((field.DbColumnName === "FishCount") && (data_row[col] !== null))
										{
											//console.log("Found FishCount.  Value = " + data_row[col]);
											var strFishCount = data_row[col].toString();
											if (strFishCount === "0")
												new_row.FishCount = 0;
											
										}
										else if ((field.DbColumnName === "NumberAnglersObserved") && (data_row[col] !== null))
										{
											//console.log("Found FishCount.  Value = " + data_row[col]);
											var strNumberAnglersObserved = data_row[col].toString();
											if (strNumberAnglersObserved === "0")
												new_row.NumberAnglersObserved = 0;
											
										}
										else if ((field.DbColumnName === "NumberAnglersInterviewed") && (data_row[col] !== null))
										{
											//console.log("Found FishCount.  Value = " + data_row[col]);
											var strNumberAnglersInterviewed = data_row[col].toString();
											if (strNumberAnglersInterviewed === "0")
												new_row.NumberAnglersInterviewed = 0;
											
										}
										else if (field.DbColumnName === "InterviewTime")// && (data_row[col] !== null))
										{
											console.log("Found InterviewTime... new row is next...");
											console.dir(new_row);
											var strNumberAnglersInterviewed = new_row.NumberAnglersInterviewed.toString();
											
											if (strNumberAnglersInterviewed === "0")
											{
												$scope.uploadErrorMessage = "NumberAnglersInterviewed cannot be 0, if InterviewTime has a time.";
												$scope.errors.push($scope.uploadErrorMessage);
											}
										}
										
										if (field.Label === "[-- Fisherman --]")
										{
											new_row.FishermanId = parseInt($scope.getFishermanId(data_row[col]));
											console.log("new_row.FishermanId = " + new_row.FishermanId);
											//if (new_row.FishermanId < 0)
											if (new_row.FishermanId < 2)
											{
												$scope.uploadErrorMessage = "Fisherman [" + data_row[col] + "] does not match any name in the Fishermen table.";
												//$scope.errors.push($scope.uploadErrorMessage); // This leaves the trace for postmortem.
												$scope.errors.push($scope.uploadErrorMessage); // This leaves the trace for postmortem.
											}
										}
										else if (field.Label === "[-- Location Id --]")
										{
											new_row.locationId = parseInt($scope.getLocationId(data_row[col]));
											console.log("new_row.locationId = " + new_row.locationId);
											if (new_row.locationId < 0)
												$scope.errors.push("Location [" + data_row[col] + "] does not match any name in the Locations table."); // This leaves the trace for postmortem.
										}
									}
									else if ($scope.DatastoreTablePrefix === "Benthic")
									{
										//console.log("Working with Benthic..., field.DbColumnName = " + field.DbColumnName);
										//console.log("data_row[col] = " + data_row[col]);
										if (field.DbColumnName === "TareMass")
										{
											if ((typeof data_row[col] !== 'undefined') && (data_row[col] !== null))
											{
												tmpValue = parseFloat(Math.round(data_row[col] * 10000)/10000);
												//console.log("tmpValue = " + tmpValue);
												new_row.TareMass = tmpValue
											}
										}
									}
									else if (($scope.DatastoreTablePrefix === "WaterTemp") || ($scope.DatastoreTablePrefix === "WaterQuality"))
									{
										if(field.Label == $scope.mappableFields[ROW_QA_STATUS_ID].Label)
											new_row.RowQAStatusId = data_row[col];
									}

									
									// Handle control types*******************************************************
									//check for numeric or ignore as blank if it isn't.
									//console.log("new_row is next...");
									//console.dir(new_row);
									if(field.ControlType == "number" && !isNumber(data_row[col]) )
									{
										//console.log("ignoring: " + field.DbColumnName + " is a number field but value is not a number: " + data_row[col]);
										return; //don't set this as a value
									}
									else if (field.ControlType === "number" && ($scope.DatastoreTablePrefix === "Benthic"))
									{
										//console.log("data_row[col] = " + data_row[col]);
										var tmpValue = -1;
										if (field.Validation === '2d') // 2-decimal places
										{
											//console.log("Found 2d..." + field.DbColumnName);
											tmpValue = parseFloat(Math.round(data_row[col] * 100)/100);
											//console.log("tmpValue = " + tmpValue);
											new_row[field.DbColumnName] = tmpValue
										}
										else if (field.Validation === 'p2d') // % with 2 decimal places
										{
											//console.log("Found p2d..." + field.DbColumnName);
											if (data_row[col] === 0)
												new_row[field.DbColumnName] = "0";
											else
											{
												tmpValue = parseFloat(Math.round(data_row[col] * 10000)/100);
												//console.log("tmpValue = " + tmpValue);
												new_row[field.DbColumnName] = tmpValue
											}
										}
										else
										{
											new_row[field.DbColumnName] = data_row[col];
										}
									}
									else if(field.ControlType == "multiselect")
									{
										//console.log("is a multiselect");
										//Create an array if we need it.
										if((typeof new_row.activityDate !== 'string') && (!Array.isArray(new_row[field.DbColumnName])) && (field.FieldRoleId === 1)) // && (loadHeader))
											$scope.row[field.DbColumnName] = [];
										else
											new_row[field.DbColumnName] = [];

										//split on commas -- if any
										var row_items = data_row[col].trim().split(",");

										for(var a = 0; a < row_items.length; a++)
										{
											var row_item = row_items[a].trim().toUpperCase();  //KBHERE -- take this off after the upgrade!

											if ((typeof new_row.activityDate !== 'string') &&  (field.FieldRoleId === 1) && (row[field.DbColumnName].indexOf(row_item) == -1))
											{
												//console.log("We have a header, multiSelect...");
												$scope.row[field.DbColumnName].push(row_item);
											}											
											else if(new_row[field.DbColumnName].indexOf(row_item) == -1)
												new_row[field.DbColumnName].push(row_item);
										}

										//new_row[field.DbColumnName] = angular.toJson(new_row[field.DbColumnName]);
										//console.log("  AND our final multiselect value == ");
										//console.log(new_row[field.DbColumnName]);
									}
									else if(field.ControlType === "select" && data_row[col] && typeof data_row[col] === "string")
									{
										//console.log(" -- " + data_row[col].trim().toUpperCase());
										new_row[field.DbColumnName] = data_row[col].trim().toUpperCase(); //uppercase select's too....  KBHERE
										
									}
									else if(field.ControlType == "datetime")
									{
										try
										{
											if(data_row[col])
											{
												var d = new Date(data_row[col]);
												if ((typeof new_row.activityDate !== 'string') && (field.FieldRoleId === 1))
													row[field.DbColumnName] = toExactISOString(d);
												else
													new_row[field.DbColumnName] = toExactISOString(d);
											}
										}
										catch(e)
										{
											console.log("problem converting datetime: " + data_row[col]);
											console.dir(e);
										}
										
										//if ((typeof new_row.activityDate !== 'string') && (field.FieldRoleId === 1))
										//	$scope.row[field.DbColumnName] = FormUtilities.checkFieldControlType(field.ControlType, data_row[col]);
										//else
										//	new_row[field.DbColumnName] = FormUtilities.checkFieldControlType(field.ControlType, data_row[col]);
										
									}
									else if(field.ControlType == "time")
									{	
										try
										{
											//console.log("We have a time field.  ");
											if(data_row[col])
											{	
												var theTime = getTimeFromDate(data_row[col]);
												//console.log("theTime = " + theTime);

												//var today = new Date();
												//var theOffset = -(today.getTimezoneOffset()/60);
												//console.log("theOffset = " + theOffset);
												
												if ((typeof new_row.activityDate !== 'string') && (field.FieldRoleId === 1))
												{
													$scope.row[field.DbColumnName] = theTime;
													//console.log("$scope.row[field.DbColumnName] = " + $scope.row[field.DbColumnName]);
												}
												else
												{
													new_row[field.DbColumnName] = theTime;
													//console.log("new_row[field.DbColumnName] = " + new_row[field.DbColumnName]);
												}
											}
										}
										catch(e)
										{
											console.log("problem converting time:  DbColumnName = " + field.DbColumnName + ", Value = " + data_row[col]);
											console.dir(e);
										}
									}
									else //just add the value to the cell
									{
										//set the value
										if ((typeof new_row.activityDate !== 'string') && (field.FieldRoleId === 1))
											$scope.row[field.DbColumnName] = data_row[col];
										else
											new_row[field.DbColumnName] = data_row[col]; //but don't uppercase anything that isn't a multiselect or select.
										
										//console.log("new_row[field.DbColumnName] = " + new_row[field.DbColumnName]);

										//console.log(field.ControlType);
										//console.log(typeof data_row[col]);

										//console.log("found a map value: " +new_row[field.DbColumnName]+" = "+data_row[col]);
										/*if(field.ControlType == "select" && data_row[col] && typeof data_row[col] == "string")
										{
											//console.log(" -- " + data_row[col].trim().toUpperCase());
											//if(typeof data_row == "string") //might otherwise be a number or something...
											//new_row[field.DbColumnName] = data_row[col].trim().toUpperCase(); //uppercase select's too....  KBHERE
											
											if ((field.DbColumnName !== "Shift") &&
												(field.DbColumnName !== "Direction") &&
												//(field.DbColumnName !== "Disposition") &&
												(field.DbColumnName !== "TotalTimeFished"))
											{										
												new_row[field.DbColumnName] = data_row[col].trim().toUpperCase(); //uppercase select's too....  KBHERE
											}
										}
										*/
										
										if (($scope.DatastoreTablePrefix === "CreelSurvey") && (field.DbColumnName === "TotalTimeFished"))
										{
											var NumMinutes = parseInt(data_row[col]);
											//console.log("NumMinutes = " + NumMinutes);
											var theHours = parseInt(NumMinutes / 60, 10);
											//console.log("theHours = " + theHours);
											var theMinutes = NumMinutes - (theHours * 60);
											//console.log("theMinutes = " + theMinutes);
											
											if (theHours < 10)
												var strHours = "0" + theHours;
											else
												var strHours = "" + theHours;
											
											if (theMinutes < 10)
												var strMinutes = "0" + theMinutes;
											else
												var strMinutes = "" + theMinutes;
																
											new_row[field.DbColumnName] = strHours + ":" + strMinutes;
											//console.log("TotalTimeFished is now = " + new_row[field.DbColumnName]);
										}
										//else if (($scope.DatastoreTablePrefix === "CreelSurvey") && (field.DbColumnName === "LocationId"))
										else if (($scope.DatastoreTablePrefix === "CreelSurvey") && (field.DbColumnName === "Location"))
										{
											//console.log("field.DbColumnName = " + field.DbColumnName + "; data_row[col] = " + data_row[col]);
											new_row[field.DbColumnName] = data_row[col];
										}
										
										else if ($scope.DatastoreTablePrefix === "SpawningGroundSurvey")
										{
											//console.log("SpawningGroundSurvey..., field.DbColumnName = " + field.DbColumnName);
											if ((field.DbColumnName === "StartTime") ||
												(field.DbColumnName === "EndTime") ||
												(field.DbColumnName === "Time"))
											{
												//console.log(field.DbColumnName + " = " + data_row[col]);
												var theString = data_row[col];
												var theLength = theString.length;
												
												// 	theString may contain a time in this formats:
												/*	(HH:MM),
												*	(HH:MM:SS),
												*	(YYYY-MM-DDTHH:mm:SS format)
												*	We must extract the time (HH:MM) from the string.
												*/
												console.log("field.DbColumnName = " + field.DbColumnName + ", theString = " + theString);
												var colonLocation = theString.indexOf(":");
												
												// Some fields may have double quotes on the time fields.
												// To determine if they do, we remove (via replace) the double quotes.
												// Then we compare the string length from before and after the replace action.
												var stringLength = theString.length;
												var tmpString = theString.replace("\"", "");
												var tmpStringLength = tmpString.length;
												console.log("colonLocation = " + colonLocation + ", stringLength = " + stringLength);
												
												if (stringLength !== tmpStringLength)
												{
													console.log("The string includes double quotes..");
													// The string includes "" (coming from a CSV file) so we must allow for them.
													if (stringLength > 5)	// "HH:MM:SS"  Note the "", or YYYY-MM-DDTHH:mm:SS
														theString = theString.substring(colonLocation - 2, stringLength - 4);
												}
												else
												{
													console.log("The string DOES NOT have double quotes...");
													if (stringLength > 5)	// "HH:MM:SS"  Note the "", or YYYY-MM-DDTHH:mm:SS
														theString = theString.substring(colonLocation - 2, stringLength - 3);
												}	
												console.log("theString = " + theString);
												new_row[field.DbColumnName] = theString;
											}									
										}
										
										if ((field.DbColumnName === "TimeStart") ||
											(field.DbColumnName === "TimeEnd") ||
											(field.DbColumnName === "InterviewTime") ||
											(field.DbColumnName === "FishReleased")
											)
										{
											// The time will come in looking like this:  YYYY-MM-DDTHH:mm:SS
											//console.log(field.DbColumnName + " = " + data_row[col]);
											var theString = data_row[col];
											var locOfTheT = theString.indexOf("T");
											theString = theString.substring(locOfTheT + 1, locOfTheT + 6);
											//console.log("theString = " + theString);
											new_row[field.DbColumnName] = theString;
										}									

									}//else  just plain text...
									
									//if ((field.FieldRoleId === 1) && ($scope.showHeaderForm)) // Header field
									//{
									//	$scope.row[field.DbColumnName] = data_row[col];
									//}
								}//if mappable
							}catch(e){
								console.dir(e);
							}
							
						});
						// End data rows***************************************************************
						
						//console.log("row (head) after checking mappable fields is next...");
						//console.dir($scope.row);
						//console.log("new_row (det) after checking mappable fields is next...");
						//console.dir(new_row);
						
						//Appraisal special importer case - remove this once we're done the appraisal import!
						//if($scope.dataset.Id == 1193)
						if ($scope.DatastoreTablePrefix === "Appraisal")
						{
							$scope.importAppraisalLine(new_row);
						}
						
						//now that the row is populated with import values, lets spin through each field again and fire any rules
						//* ---- Run the rules for each field on this row ---- *//
						var row = new_row;  // Note:  This variable gets used later, not immediately.
						//console.log("Ok, now we'll run the rules for each column in this row");
						
						//console.error("About to loop through $scope.mapping AGAIN, checking rules...");
						angular.forEach($scope.mapping, function(field, col){
							//console.log("field = " + field + ", col = " + col);
							//var value = row[field.DbColumnName];
							//if (typeof field.DbColumnName !== 'undefined')
							//{
							//	var value = row[field.DbColumnName];
								//console.log("field.DbColumnName = " + field.DbColumnName + "; value = " + value); // Debug step
							//}

							if (($scope.DatastoreTablePrefix === "ScrewTrap") && (field.DbColumnName === "TextualComments"))
							{
								//console.log("We are in ScrewTrap, col TextualComments");
								//console.log("new_row before add is next...");
								//console.dir(new_row);
								
								// Verify new_row.TextualComments exists before checking it.
								if (typeof new_row.TextualComments !== 'undefined')
								{
									// Bracket the letter with X, so we can easily see if there is a leading or trailing space.
									//console.log("new_row.TextualComments = X" + new_row.TextualComments + "X");  
									//if ((new_row.TextualComments.indexOf(" U ") > -1) ||		// Embedded
										//(new_row.TextualComments.indexOf("U ") > -1)  ||		// At the beginning
										//(new_row.TextualComments.indexOf(" U") > -1)  ||		// At the end
										//(new_row.TextualComments === "U" )					// All by itself
									if (
										(new_row.TextualComments.length > 3 && new_row.TextualComments.indexOf(" U ") > -1) ||		// Embedded
										(new_row.TextualComments.length > 2 && new_row.TextualComments.indexOf("U ") > -1)  ||		// At the beginning
										(new_row.TextualComments.length > 2 && new_row.TextualComments.indexOf(" U") > -1)  ||		// At the end
										(new_row.TextualComments.length === 1 && new_row.TextualComments.indexOf("U") > -1)			// All by itself
										)
										{
											//console.log("Found a U...");
											new_row.ReleaseLocation = "UPSTREAM";
										}
									//else if ((new_row.TextualComments.indexOf(" D ") > -1) ||		// Embedded
										//(new_row.TextualComments.indexOf("D ") > -1)  ||		// At the beginning
										//(new_row.TextualComments.indexOf(" D") > -1)  ||		// At the end
										//(new_row.TextualComments === "D" ))			// All by itself
										//(new_row.TextualComments.indexOf("D") > -1))			// All by itself
									else if ((new_row.TextualComments.length > 3 && new_row.TextualComments.indexOf(" D ") > -1) ||		// Embedded
										(new_row.TextualComments.length > 2 && new_row.TextualComments.indexOf("D ") > -1)  ||		// At the beginning
										(new_row.TextualComments.length > 2 && new_row.TextualComments.indexOf(" D") > -1)  ||		// At the end
										(new_row.TextualComments.length === 1 && new_row.TextualComments.indexOf("D") > -1))			// All by itself
										{
											//console.log("Found a D...");
											new_row.ReleaseLocation = "DOWNSTREAM";
										}
									else
									{
										//console.log("Not a U or D");
									}

										
									//console.log("new_row after adding TextualComments is next...");
									//console.dir(new_row);
								}
								else
								{
									//console.log("new_row.TextualComments is undefined; skipping...");
								}
							}

							try{
								//fire Field rule if it exists -- OnChange
								if(field.Field && field.Field.Rule && field.Field.Rule.OnChange){
									//console.log("Firing master rule: " + field.Field.Rule.OnChange);
									eval(field.Field.Rule.OnChange);
								}

								//fire Datafield rule if it exists -- OnChange
								if(field.Rule && field.Rule.OnChange){
									//console.log("Firing dataset rule: " + field.Rule.OnChange);
									eval(field.Rule.OnChange);
								}
							}catch(e){
								//so we don't die if the rule fails....
								console.dir(e);
							}

						});
						//console.log("new_row after checking field rules is next...");
						//console.dir(new_row);


						//last validation before we add row:
						// -- nothing so far.
						
						//add imported row to datasheet.
						if(new_row.activityDate)
							$scope.dataSheetDataset.push(new_row);
							
					}
					catch(e)
					{
						$scope.Logger.debug(e);
					}
					//loadHeader = false;
					
					//console.log("$scope.dataSheetDataset is next...");
					//console.dir($scope.dataSheetDataset);
		 		});
				
				//console.log("$scope is next");
				//console.dir($scope);

				$scope.UploadResults.showPreview = true;

				$scope.toggleDuplicates();

            	$scope.validateGrid($scope);
        		$scope.floatErrorsToTop();

				console.log("$scope is next...");
				console.dir($scope);
				console.log("The following are...$scope.dataSheetDataset, $scope.dataset.Datastore.TablePrefix");
				console.dir($scope.dataSheetDataset);
				console.log($scope.dataset.Datastore.TablePrefix);
        		ChartService.buildChart($scope, $scope.dataSheetDataset, $scope.dataset.Datastore.TablePrefix, {width: 800, height: 360});
					//ChartService.buildChart($scope, $scope.dataSheetDataset, $scope.dataset.Datastore.TablePrefix, {height: 360, width: 800});

				$scope.importing = false;
				console.log("Set $scope.importing = false...");
				//console.dir($scope);
			};

			$scope.getFishermanId = function(fishermanName)
			{
				//console.log("Inside getFishermanId...");
				//console.log("fishermanName = " + fishermanName);
				
				var theFishermanId = 0;
				var keepGoing = true;
				var foundFisherman = false;
				angular.forEach($scope.fishermenOptions, function(fisherman, key){
					if (keepGoing)
					{
						//console.log("key = " + key + ", fisherman = " + fisherman);
						if (fishermanName === fisherman)
						{
							//console.log("Fount the fisherman:  " + fisherman);
							theFishermanId = key;
							foundFisherman = true;
							keepGoing = false;
						}
					}
				});
				
				//return theFishermanId;
				if (foundFisherman)
					return theFishermanId;
				else
					return 1; //-1;				
			};
			
			$scope.getLocationId = function(locationName)
			{
				//console.log("Inside getLocationId...");
				//console.log("locationName = " + locationName);
				
				var theLocationId = 0;
				var keepGoing = true;
				var foundLocation = false;
				angular.forEach($scope.locationOptions, function(location, key){
					if (keepGoing)
					{
						//console.log("key = " + key + ", location = " + location);
						if (locationName === location)
						{
							console.log("Found the location:  " + location);
							theLocationId = key;
							foundLocation = true;
							keepGoing = false;
						}
					}
				});
				
				if (foundLocation)
					return theLocationId;
				else
					return -1;
			};

			$scope.uploadFile = function()
			{
				$scope.loading=true;
					console.log("serviceUrl = " + serviceUrl);
					if (typeof $scope.project.Id !== 'undefined')
						console.log("project.Id = " + $scope.project.Id);
					else
						console.log("project.Id is not set.  User should go to dataset activities page first.");

					console.log("startOnLine = " + $scope.startOnLine);
					console.log("file...");
					console.dir($scope.file);
			      $scope.upload = $upload.upload({
			        url: serviceUrl + '/data/UploadImportFile', //upload.php script, node.js route, or servlet url
			        method: "POST",
			        // headers: {'headerKey': 'headerValue'},
			        // withCredential: true,
			        //data: {ProjectId: $scope.project.Id, StartOnLine: $scope.startOnLine},
			        data: {ProjectId: $scope.project.Id, DatasetId: $scope.dataset.Id, Title: $scope.file.name, Description: "Uploaded file " + $scope.file.name, StartOnLine: $scope.startOnLine},
			        file: $scope.file,
			        // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
			        /* set file formData name for 'Content-Desposition' header. Default: 'file' */
			        //fileFormDataName: myFile, //OR for HTML5 multiple upload only a list: ['name1', 'name2', ...]
			        /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
			        //formDataAppender: function(formData, key, val){}
			      }).progress(function(evt) {
					console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
			      }).success(function(data) {
			        // file is uploaded successfully

			        $scope.UploadResults.Data = angular.fromJson(data);
					console.log("$scope.UploadResults.Data is next...");
					console.dir($scope.UploadResults.Data);
					
			        $scope.fileFields = $scope.UploadResults.Data.columns;
					
					// Note:  When we click preview, the fish do not show.
					// It might be because JavaScript runs asynchronous and zips through things,
					// Running the next two lines, before the one above ($scope.upload) has finished.
					// We must refactor this, and how to keep from turning the spinning fish off,
					// before the upload job is done.
			        $scope.loading=false;
			        $scope.enablePreview = true;
			      })
			      .error(function(data)
			      	{
			      		//$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
						var errorStem = "There was a problem uploading your file.\n";
						var errorSpecificPart1 = "The form says the column headers start on line " + $scope.startOnLine + ".  ";
						var errorSpecificPart2 = "Is this correct?  Also verify that the data/time entries are in 24-hour format.";
			      		$scope.uploadErrorMessage = errorStem + errorSpecificPart1 + errorSpecificPart2;
			      		console.log("$scope.upload next...");
						console.dir($scope.upload);
						$scope.loading=false;
			      	});
			      //.then(success, error, progress);
			};


			$scope.onFileSelect = function($files) {
			    //$files: an array of files selected, each file has name, size, and type.

			    $scope.files = $files;
			    $scope.file = $files[0];

			 };

			 $scope.cancel = function(){
			 	if($scope.UploadResults.showPreview)
			 	{
				 	if(!confirm("Looks like you've made changes.  Are you sure you want to leave this page?"))
				 		return;
				 }

				$location.path("/activities/"+$scope.dataset.Id);
			 };

			 $scope.doneButton = function(){
			 	$scope.activities = undefined;
			 	$route.reload();
			 };

			 $scope.viewButton = function(){
			 	$location.path("/activities/"+$scope.dataset.Id);
			 }

			$scope.saveDataSheet = function() {
				console.log("Inside import-controllers.js, $scope.saveDataSheet...");
				console.log("$scope.dataSheetDataset is next...");
				console.dir($scope.dataSheetDataset);
				
				var strYear = null;
				var strMonth = null;
				var strDay = null;
				
				if($scope.gridHasErrors)
				{
					if(!confirm("There are validation errors.  Are you sure you want to save anyway?"))
						return;
				}
				
				var theHours = -1;
				var theMinutes = -1;
				var TotalTimeFished = -1;
				
				for (var i = 0; i < $scope.dataSheetDataset.length; i++)
				{
					if ($scope.DatastoreTablePrefix === "CreelSurvey")
					{
						if ((typeof $scope.dataSheetDataset[i].TotalTimeFished !== 'undefined') && ($scope.dataSheetDataset[i].TotalTimeFished != null))
						{
							//console.log("TotalTimeFished for row " + i + " = " + $scope.dataSheetDataset[i].TotalTimeFished);
							theHours = parseInt($scope.dataSheetDataset[i].TotalTimeFished.substring(0,2));
							//console.log("theHours = " + theHours);
							theMinutes = parseInt($scope.dataSheetDataset[i].TotalTimeFished.substring(3,5));
							//console.log("theMinutes = " + theMinutes);
							TotalTimeFished = theHours * 60 + theMinutes;
							//console.log("TotalTimeFished (in min) = " + TotalTimeFished);
							$scope.dataSheetDataset[i].TotalTimeFished = TotalTimeFished;
							
							theHours = -1;
							theMinutes = -1;
							TotalTimeFished = -1;
						}
						
						//console.log("$scope.dataSheetDataset[i].activityDate = " + $scope.dataSheetDataset[i].activityDate);
						strYear = $scope.dataSheetDataset[i].activityDate.substr(0, 4);
						//console.log("strYear = " + strYear);
						
						strMonth = $scope.dataSheetDataset[i].activityDate.substr(5, 2);
						//console.log("strMonth = " + strMonth);
						if (strMonth.length < 2)
							strMonth = "0" + strMonth;
						
						strDay = $scope.dataSheetDataset[i].activityDate.substr(8, 2);
						//console.log("strDay = " + strDay);
						if (strDay.length < 2)
							strDay = "0" + strDay;
						
						$scope.dataSheetDataset[i].TimeStart = strYear + "-" + strMonth + "-" + strDay + "T" + $scope.dataSheetDataset[i].TimeStart + ":00.000";
						//console.log("$scope.dataSheetDataset[i].TimeStart = " + $scope.dataSheetDataset[i].TimeStart);
						$scope.dataSheetDataset[i].TimeEnd = strYear + "-" + strMonth + "-" + strDay + "T" + $scope.dataSheetDataset[i].TimeEnd + ":00.000";
						//console.log("$scope.dataSheetDataset[i].TimeEnd = " + $scope.dataSheetDataset[i].TimeEnd);
						
						if ((typeof $scope.dataSheetDataset[i].InterviewTime !== 'undefined') && ($scope.dataSheetDataset[i].InterviewTime != null))
						{
							$scope.dataSheetDataset[i].InterviewTime = strYear + "-" + strMonth + "-" + strDay + "T" + $scope.dataSheetDataset[i].InterviewTime + ":00.000";
							//console.log("$scope.dataSheetDataset[i].InterviewTime = " + $scope.dataSheetDataset[i].InterviewTime);
						}
					}
					
					if (typeof $scope.dataSheetDataset[i].Dry === 'undefined') // If Dry is missing, added and default it to NO?
						$scope.dataSheetDataset[i].Dry = "NO";
				}
				
				//console.log("ActivityFields...");
				//console.dir($scope.ActivityFields);
				
				//prepare dataset for saving -- add defaultrowqastatusid, move activityqastatusid
				for (var i = 0; i < $scope.dataSheetDataset.length; i++) {
					var row = $scope.dataSheetDataset[i];

					if($scope.showHeaderForm)
						row = angular.extend(row, $scope.row, $scope.ActivityFields); // copy in the header fields...  //TODO: might be nicer to pass into parseActivitySheet below...

					//copy in the selected qastatus (default was set above)
					row.ActivityQAStatus = {
	        			QAStatusId: ""+row.QAStatusId,
	        			Comments: row.QAComments
	        		};

	        		row.QAStatusId = row.RowQAStatusId;

					//console.log("row is next...");
					//console.dir(row);
				}

				//var sheetCopy = angular.copy($scope.dataSheetDataset); //causes memory problems on IE for large files.
	            //$scope.activities = ActivityParser.parseActivitySheet($scope.dataSheetDataset, $scope.fields);
	            $scope.activities = ActivityParser.parseActivitySheet($scope.dataSheetDataset, $scope.fields, $scope.DatastoreTablePrefix, "Import", $scope.dataset.QAStatuses);
				console.log("$scope.activities is next...");
				console.dir($scope.activities);
	            
	            if(!$scope.activities.errors)
	            {				
	                DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
	            }

			};
			
			$scope.eventTimer = function(){
				var d = new Date();
				console.log(d.toLocaleTimeString(),1000);
			};

	    	$scope.openDuplicatesModal = function(){
				var modalInstance = $modal.open({
					templateUrl: 'partials/modals/viewduplicates-modal.html',
					controller: 'ModalDuplicatesViewCtrl',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});
	    	};

	    	//this is for custom import of appraisals
	    	$scope.importAppraisalLine = function(row){
	    		//console.dir(row);
	    		//console.log('starting: '+row['Allotment']);
				//1) create location query and lookup TSR and SDEOBJECTID by parcelid
				$scope.map.queryMatchParcel(row['Allotment'], function(features){
					//console.log("back from query!");
					if(features.length == 0)
                    {
                        console.log("didn't find parcelid: "+row['Allotment']);
                    }
                    else
                    {
                    	//console.dir(features[0].attributes['OBJECTID']);
                    	//console.dir(features[0].attributes['TSR']);
                    	var tsr = features[0].attributes['TSR'];
                    	if(tsr)
                    		tsr = tsr.replace("adminstration","admin");
                    	row.TSRFiles = '[{"Name":"View TSR","Link":"'+tsr+'"}]';

                    	//set some specific defaults -- this is a one-time thing (famous last words)
                    	row.AppraisalYear = '2014';
						row.AppraisalType = 'Land Buy Back';
						row.Appraiser = 'David Nicholson';

                    	// Wave 1
                    	//row.CobellAppraisalWave = 'Wave 1';
                    	//row.AppraisalStatus = 'Complete';
                    	//row.AllotmentStatus = 'Submitted to Regional Office';

                    	//other waves
                    	row.CobellAppraisalWave = 'Wave 3';
                    	row.AppraisalStatus = 'Not Started';
                    	row.AllotmentStatus = 'Requested';
                    	
                    	var map_loc = '//gis.ctuir.org/DECD/Appraisals/maps/Round_Basemaps_DECD_';
                    	row.MapFiles = '[{"Name":"Imagery","Link":"'+map_loc+'Imagery_'+row['Allotment']+'.pdf"},{"Name":"Plat","Link":"'+map_loc+'Plat_'+row['Allotment']+'.pdf"},{"Name":"Soils","Link":"'+map_loc+'Soils_'+row['Allotment']+'.pdf"},{"Name":"Topo","Link":"'+map_loc+'Topo_'+row['Allotment']+'.pdf"},{"Name":"Zoning","Link":"'+map_loc+'Zoning_'+row['Allotment']+'.pdf"}]';
                    	
                    	row.LastAppraisalRequestDate = new Date();

                    	row.Acres = features[0].attributes['ACRES_GIS'];

                    	//create a new location from the map feature selected
		                var new_location = {
		                    LocationTypeId: LOCATION_TYPE_APPRAISAL,
		                    SdeFeatureClassId: SDE_FEATURECLASS_TAXLOTQUERY,
		                    SdeObjectId: features[0].attributes['OBJECTID'],
		                    Label: features[0].attributes['PARCELID'],
		                };

		                var promise = DatastoreService.saveNewProjectLocation($scope.project.Id, new_location);
		                promise.$promise.then(function(location_data){
		                   //console.log("done and success!");
		                   //console.dir(location_data);
		                   row.locationId = location_data.Id;
		               });
                    }
				});
				//2) create new location (with sdeobjectid)


				//3) set new location in row
				//4) set tsr in row
				//5) create map links in row

			}

	    }
]);


mod_di.controller('ModalDuplicatesViewCtrl', ['$scope','$modalInstance',
	function($scope, $modalInstance){

		$scope.gridDuplicates = {
			data: 'DuplicateRecordsBucket',
			columnDefs: [{
				   field: 'locationId',
                    displayName: 'Location',
                    cellFilter: 'locationNameFilter'
                },
                {
                    field: 'activityDate',
                    displayName: 'Activity Date',
                    cellFilter: 'date: \'MM/dd/yyyy\'',
                }],
		};

		$scope.ok = function(){
			$modalInstance.dismiss();
		};

	}
]);
