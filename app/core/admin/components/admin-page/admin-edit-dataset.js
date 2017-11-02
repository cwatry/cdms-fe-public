﻿
var admin_edit_dataset = ['$scope', '$modal', '$routeParams', 'DatasetService', 'CommonService','ProjectService','AdminService',
    function ($scope, $modal, $routeParams, DatasetService, CommonService, ProjectService, AdminService ){

		$scope.dataset = DatasetService.getDataset($routeParams.Id);
		$scope.FieldLookup = {};
        $scope.SelectedField = null;
        $scope.saveResults = {};
		
		$scope.Sources = CommonService.getSources();
		$scope.Instruments = ProjectService.getInstruments();

		$scope.$watch('dataset.Id', function(){
			
			if(!$scope.dataset.Id)
				return;
			
			console.log("Inside dataset.Id watcher...");
			console.dir($scope.dataset);
		
			if(!$scope.MasterFields)
				$scope.MasterFields = AdminService.getMasterFields($scope.dataset.Datastore.FieldCategoryId);

			angular.forEach($scope.dataset.Fields.sort(orderByAlpha), function(field){
				//parseField(field, $scope);
				console.log("field.Field.DbColumnName = " + field.Field.DbColumnName);
				if(field.Field.PossibleValues)
					field.Values = makeObjectsFromValues($scope.dataset.DatastoreId+field.DbColumnName, field.Field.PossibleValues);

				field.SourceId = ""+field.SourceId; //so we can find it in the dropdown!
				field.InstrumentId = ""+field.InstrumentId;
			});

			$scope.dataFields = $scope.dataset.Fields;

		});
		
		$scope.$watch('Sources',function(){
			if($scope.Sources.length > 0)
			$scope.SourcesLookup = makeObjects($scope.Sources, 'Id','Name');
		},true);

		$scope.$watch('Instruments',function(){
			if($scope.Instruments.length > 0)
			$scope.InstrumentsLookup = makeObjects($scope.Instruments, 'Id','Name');
		},true);

		$scope.$watch('saveResults.success', function(){
			if (!$scope.saveResults.success)
				return;

            console.log("The result of saveResults: " + $scope.saveResults.success);
            console.log(" - so now we'll reload the dataset: " + $routeParams.Id);
			
			DatasetService.clearDataset();
			$scope.dataset = DatasetService.getDataset($routeParams.Id); //reload
			$scope.SelectedField = null;

		},true);

		$scope.removeField = function()
		{
			if(!confirm("Are you sure you want to remove '" + $scope.SelectedField.Label + "' from this dataset?"))
                return;

			$scope.saveResults = {};
			AdminService.removeField($scope.dataset.Id, $scope.SelectedField.FieldId, $scope.saveResults);
		}

		$scope.addMasterField = function()
		{
			console.log("Inside admin-controller.js, addMasterField...");
			$scope.saveResults = {};
			
			// Note:  Given a list with zero-based index (0, 1, 2, 3, etc.), like we have here.
			// With angular, when you select the first item in a list, it often (always?) shows blank (null).
			// The problem does not present itself for items 1 and following.
			// This problem is a known issue (see this article:  http://stackoverflow.com/questions/12654631/why-does-angularjs-include-an-empty-option-in-select).
			// To avoid this problem, we access the first item (0), using index 0.
			if ($scope.newField === null)
				$scope.newField = $scope.MasterFields[0].Id;
			
			console.log("$scope.newField (after checking) = " + $scope.newField);
			AdminService.addMasterFieldToDataset($scope.dataset.Id, $scope.newField, $scope.saveResults);
			//$scope.saveResults = AdminService.addMasterFieldToDataset($scope.dataset.Id, $scope.newField, $scope.saveResults);
			// JavaScript might run the next lines too fast, so I (GC) put them into watch saveResults.DatasetId up above.
			//setTimeout(function(){
			//	DatasetService.clearDataset();
            //	$scope.dataset = DatasetService.getDataset($routeParams.Id); //reload
            //},400);
		};

		$scope.saveField = function()
		{
			$scope.saveResults = {};
			AdminService.saveDatasetField($scope.SelectedField, $scope.saveResults);
		};

		$scope.selectField = function(field){
			$scope.SelectedField = field;
		};
		

	}
];