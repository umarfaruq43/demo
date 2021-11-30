/* ==========================================================================
 * Template: FLKS Fullpack Admin Theme
 * ---------------------------------------------------------------------------
 * Author: FLKS Student JS
 * Date : 04/16/2018
 * ========================================================================== */

app.controller('StudentController', ['$scope', 'defaultService', 'hostelService', 'DTOptionsBuilder', function ($scope, defaultService, hostelService, DTOptionsBuilder) {
    $scope.errors = [];
    $scope.transactions = [];
    $scope.roomBedSpaces = [];
    $scope.courseList = [];
    $scope.feeTotalAmount = 0.00;

    $scope.dtOptionsnoBtn = DTOptionsBuilder.newOptions()
        .withDOM('<"html5buttons"B>lTfgitp')
        .withButtons([]);

    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withDOM('<"html5buttons"B>lTfgitp')
        .withButtons([
            //{extend: 'copy'},
            {extend: 'csv'},
            {extend: 'excel', title: 'SitePage'},
            {extend: 'pdf', title: 'SitePage'},

            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');

                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);

    $scope.$watch('hostelfee.hostel_id', function(val) {
        $scope.hostelfee.block_id = "";
        $scope.feeTotalAmount = 0.00;
        $scope.selectedBedSpace = "";
        $(".feechk").val('0.00');
        $("#bedspace_id").val(0);
        $("#bedspace_name").val('');
        $("#hAmt").html("&#8358;0.00");
        $scope.roomBedSpaces = [];
    });

    /**
     * On change of Hostel
     * @param id
     */
    $scope.onSelectLoadHostelBlock = function (id) {
        hostelService.onSelectLoadHostelBlock(id, function (response) {
            $scope.hostelBlocks = response;
        });
    }

    /**
     * On change of Hostel for available blocks
     * @param id
     */
    $scope.onSelectLoadHostelBlockHasAvailableBedspace = function (id) {
        hostelService.onSelectLoadHostelBlockHasAvailableBedspace(id, function (response) {
            $scope.hostelBlocks = response;
        });
    }

    $scope.calAmount = function () {
        $scope.newAmount = 0.00;
        $(".feechk:checked").each(function () {
            $scope.newAmount = $scope.newAmount + parseFloat($(this).val() * 1);
        });
        if($scope.newAmount > 0)
            $scope.feeTotalAmount = $scope.newAmount + parseFloat($scope.tranx_change * 1);
        else
            $scope.feeTotalAmount = $scope.newAmount
    };

    $scope.calAmount2 = function (count) {
        $scope.newAmount = 0.00;
        $(".feechk"+count).each(function () {
            $scope.newAmount = $scope.newAmount + parseFloat($(this).val() * 1);
        });
        if($scope.newAmount > 0)
            $scope.feeTotalAmount = $scope.newAmount + parseFloat($scope.tranx_change * 1);
        else
            $scope.feeTotalAmount = $scope.newAmount
    };

    $scope.generateMyResult = function () {
        FlicksApp.setOverlay();
    }

    //---- load My Room with BedSpaces --- //
    $scope.loadHotelBlockRoomWithBedSpaces = function (id) {
        var urlPath = '/' + urlPrefix + 'hostel/room/'+ id +'/fetch-with-bedspace';
        FlicksApp.setOverlay();
        defaultService.allGetRequests(urlPath)
            .then(function (resp) {
                $scope.roomBedSpaces = resp.data;
                FlicksApp.offOverlay();
            })
            .then(function (error) {
                if (typeof error != 'undefined') {
                    console.log('An error occurred: ' + JSON.stringify(error));
                }
                FlicksApp.offOverlay();

            });

    };

    $scope.selectedBedSpace = "";
    $scope.onSelectMyBedSpace = function ($event, id, room, name, amt) {
        $scope.selectedBedSpace = room+'-'+name;
        $(".feechk").val(amt);
        $("#bedspace_id").val(id);
        $("#bedspace_name").val(room+'-'+name);
        $("#hAmt").html("&#8358;"+amt);
        $scope.newAmount = parseFloat(amt * 1);

        if($scope.newAmount > 0)
            $scope.feeTotalAmount = $scope.newAmount + parseFloat($scope.tranx_change * 1);

       // alert($event.currentTarget.getAttribute('class'));
        //$event.currentTarget.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Processing';
    }

    $scope.initiateReservedBedSpace = function () {
        $(document).ready(function(){
            document.getElementById("myReserved").click();
        });
    }

    $scope.submitReserve = function () {
        //angular.element('#reserveHostel').trigger('click');
        angular.element(document.querySelector('#reserveHostel')).triggerHandler('click');
        //$('#reserveHostel').trigger("click");
        alert('reserve btn click');
    }

    $scope.callLoaderReserveBedspace = function ($event) {
        var initialBtn = $event.currentTarget.innerHTML;
        $event.currentTarget.innerHTML = "<i class=\"fa fa-spinner fa-spin\"></i> Processing...";
        $event.currentTarget.disabled = true;
        swal({
                title: "Reserve Bedspace",
                text: "You're about to reserve "+$('#bedspace_name').val()+". Do you want to continue?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, proceed!",
                closeOnConfirm: true,
                closeOnCancel: false
            }, function (isConfirm) {
                if(isConfirm){
                    FlicksApp.setOverlay();
                    $('#forReserve').html("<input type='hidden' name='reserveHostel'>");
                    $('#frmhostelbedfee').submit();
               } else {
                    $event.currentTarget.innerHTML = initialBtn;
                    $event.currentTarget.disabled = false;
                    swal("Cancelled", "Bedspace reservation cancelled", "error");
                }
            });
    }

    //====================================
    //   COURSE REGISTRATION
    //====================================
    //---- load course registration --- //
    $scope.loadCourseRegistration = function () {
        $scope.alert = null;
        if($scope.mycourse.academic_semester_id == 0 || $scope.mycourse.academic_course_registration_status_id == 0
            || $scope.mycourse.academic_semester_id == "" || $scope.mycourse.academic_course_registration_status_id == ""
            || typeof $scope.mycourse.academic_semester_id == "undefined" || typeof $scope.mycourse.academic_course_registration_status_id == "undefined" ){
            $scope.courseList = [];
            return false;
        }

        var params = $scope.mycourse;
        FlicksApp.setOverlay();

        var urlPath = '/' + urlPrefix + 'student/course/fetch';
        defaultService.allPostRequests(urlPath, params)
            .then(function (resp) {
                $scope.courseList = resp.data; //push(resp.data);
                FlicksApp.offOverlay();
            })
            .then(function (error) {
                if (typeof error != 'undefined') {
                    console.log('An error occurred: ' + JSON.stringify(error));
                }
                FlicksApp.offOverlay();
            });
    };

    $scope.allotCourseRegistration = function ($event) {
        var initialBtn = $event.currentTarget.innerHTML;
        $event.currentTarget.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Processing';
        $event.currentTarget.disabled = true;
        $scope.alert = null;

        //--------- validate unassigned checkbox ---------
        var chkArrayUnassign = [];
        $(".unassignchk:checked").each(function () {
            chkArrayUnassign.push($(this).val());
        });
        var SelectedUnassign;
        SelectedUnassign = chkArrayUnassign.join(',') + ",";
        SelectedUnassign = SelectedUnassign.slice(0, -1);

        if (SelectedUnassign.length <= 0) {
            $scope.alert = {status: 'danger', message: 'Please select at least one academic course to register'};
            // $event.currentTarget.innerHTML = 'Register Course(s) <i class="fa fa-arrow-right"></i>';
            $event.currentTarget.innerHTML = initialBtn;
            $event.currentTarget.disabled = false;
            return;
        }

        $scope.mycourse.SelectedUnassign = SelectedUnassign;
        var params = $scope.mycourse;
        FlicksApp.setOverlay();
        var urlPath = '/' + urlPrefix + 'student/course/allot';
        defaultService.allPostRequests(urlPath, params)
            .then(function (resp) {
                if (resp.status) {
                    FlicksApp.handlemsgtoast(resp.msg, "success");
                    $scope.alert = {status: 'success', message: resp.msg};
                    $scope.mycourse.SelectedUnassign = {};
                    $scope.loadCourseRegistration();
                }
                else {
                    var errors = resp.validation;
                    $scope.errors.push(errors);
                    FlicksApp.handlemsgtoast(resp.msg, "error");
                }

                $event.currentTarget.innerHTML = initialBtn;
                $event.currentTarget.disabled = false;
                FlicksApp.offOverlay();
            })
            .then(function (error) {
                if (typeof error != 'undefined') {
                    angular.forEach(error.data, function (value, key) {
                        $scope.alert = {status: 'danger', message: value[0]};
                        return;
                    });
                    $event.currentTarget.innerHTML = initialBtn;
                    $event.currentTarget.disabled = false;
                    console.log('An error occurred: ' + JSON.stringify(error));
                }
            });

    }

    $scope.removeCourseRegistration = function ($event) {
        var initialBtn = $event.currentTarget.innerHTML;
        $event.currentTarget.innerHTML = '<i class="fa fa-spinner fa-spin"></i>  Removing';
        $event.currentTarget.disabled = true;
        $scope.alert = null;

        //--------- validate assigned checkbox ---------
        var chkArrayAssigned = [];
        $(".assignchk:checked").each(function () {
            chkArrayAssigned.push($(this).val());
        });
        var SelectedAssigned;
        SelectedAssigned = chkArrayAssigned.join(',') + ",";
        SelectedAssigned = SelectedAssigned.slice(0, -1);

        if (SelectedAssigned.length <= 0) {
            $scope.alert = {status: 'danger', message: 'Please select at least one academic course to remove'};
            $event.currentTarget.innerHTML = initialBtn;
            $event.currentTarget.disabled = false;
            return;
        }

        $scope.mycourse.SelectedAssigned = SelectedAssigned;
        var params = $scope.mycourse;
        FlicksApp.setOverlay();
        var urlPath = '/' + urlPrefix + 'student/course/remove';
        defaultService.allPostRequests(urlPath, params)
            .then(function (resp) {
                if (resp.status) {
                    FlicksApp.handlemsgtoast(resp.msg, "success");
                    $scope.alert = {status: 'success', message: resp.msg};
                    $scope.mycourse.SelectedAssigned = {};
                    $scope.loadCourseRegistration();
                }
                else {
                    var errors = resp.validation;
                    $scope.errors.push(errors);
                    FlicksApp.handlemsgtoast(resp.msg, "error");
                }

                $event.currentTarget.innerHTML = initialBtn;
                $event.currentTarget.disabled = false;
                FlicksApp.offOverlay();
            })
            .then(function (error) {
                if (typeof error != 'undefined') {
                    angular.forEach(error.data, function (value, key) {
                        $scope.alert = {status: 'danger', message: value[0]};
                        return;
                    });
                    $event.currentTarget.innerHTML = initialBtn;
                    $event.currentTarget.disabled = false;
                    FlicksApp.offOverlay();
                    console.log('An error occurred: ' + JSON.stringify(error));
                }
            });
    }

    //--- open course print model --- //
    $scope.openCoursePrintModal = function ($event) {
        $scope.alert = null;
        var course = $($event.currentTarget);
        FlicksApp.setOverlay();
        $('#modal-icon').html("<i class='fa fa-" + course.attr("data-icon") + " modal-icon'></i>");
        $('#title').html(course.attr("data-title"));
        $('.modal-body').load(course.attr("data-link"),function(){
            $('#myModalCourse').modal({show: true});
            FlicksApp.offOverlay();
        });
    };

    $scope.payBalance = function ($event) {
        FlicksApp.setOverlay();
        var initialBtn = $event.currentTarget.innerHTML;
        $event.currentTarget.innerHTML = '<i class="fa fa-spinner fa-spin"></i>  Processing';
        $event.currentTarget.disabled = true;
        var params = $($event.currentTarget);

        var tranx_change = $("#tranx_change").val();
        var formField = "<input type='hidden' name='" + params.attr("data-name") + "' value='" + params.attr("data-balance") + "'/>" +
            "<input type='hidden' name='tranx_change' value='"+tranx_change+"'/>" +
            "<input type='hidden' name='comprehensive_parent_ref_id' value='" + params.attr("data-comprehensive") + "'/>" +
            "<input type='hidden' name='summary_parent_ref_id' value='" + params.attr("data-summary") + "'/>";
        $("#balfrmContainer").html(formField);
        $('#balFrm').submit();
    }

}]);