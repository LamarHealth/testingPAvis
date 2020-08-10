var userObject = {};
var api;
var CommercialTable;
var MastersTable;
var BillsOfLadingTable;
//Object Data
const customerList = [];
const commercialCargo = [];
const masters = [];
const billsOflading = [];
//Reference Data
const ports = [];
const vessels = [];
const cargoSubTypes = [];
const shippingTerms = [];
const cargoStatuses = [];
const rateFeeTypes = [];
const BOLStatuses = [
    {id: 1, description: 'BOL Created'},
    {id: 2, description: 'BOL Draft'},
    {id: 3, description: 'BOL Approved'},
    {id: 4, description: 'BOL Paid'},
    {id: 5, description: 'BOL Released'},
    {id: 6, description: 'BOL On Hold'}
];
const freightTerms = [
    {'id': 1, 'freightTerm': 'Prepaid'},
    {'id': 2, 'freightTerm': 'Collect'}
];
//Helper function written to make referencing each table easier
//Pass in the reference table you want to use, and the id of what you're looking for Returns the object from the table associated with that id
//*****DOESN'T WORK FOR CUSTOMERLIST AND BOOKINGLIST*****
function readReferenceTables(refTable, id) {
    let tmp = refTable.filter(entry => {
        return parseInt(entry.id) === parseInt(id);
    })
    return tmp[0];
}

$(document).ready(function() {
    init();
});


function init() {
    //const ref = new Reference();
    readCargo();
}

function clearAdvancedSearchFilters() {
    $('.CommercialColumnFilter').val("");
    const listOfFilters = $('.CommercialColumnFilter');
    for(var i = 0; i < listOfFilters.length; i++){
        const tmp = new String(listOfFilters[i].id).split('_')
        $('#CommercialCargoTable').DataTable().column(`${tmp[1]}:name`).search('').draw();
    }
    $('#CommercialFilterByCargoStatus').val('all');
    $('#CommercialCargoTable').DataTable().column('cargoStatus:name').search("").draw(); 
    $('#CommercialCargoBadge').html($('#CommercialCargoTable').DataTable().rows( {search:'applied'} ).count());
}

function openCommercialMastersModal() {
    const BOLObject = new BillOfLading();
    const GeneralState = {
        BOLStatus: 1,
        FreightTerm: 1,
        CarrierBookingRef: false,
        ExportRef: false,
        Forwarder: false,
        ForwarderAccount: false,
        ForwarderName: false,
        ForwarderEmail: false,
        ForwarderPhone: false,
        ForwarderFax: false,
        Shipper: false,
        ShipperAccount: false,
        ShipperName: false,
        ShipperEmail: false,
        ShipperPhone: false,
        ShipperFax: false,
        Consignee: false,
        ConsigneeAccount: false,
        ConsigneeName: false,
        ConsigneeEmail: false,
        ConsigneePhone: false,
        ConsigneeFax: false,
        Notify: false,
        NotifyAccount: false,
        NotifyName: false,
        NotifyEmail: false,
        NotifyPhone: false,
        NotifyFax: false,
        POL: false,
        POD: false,
        Vessel: false,
        Voyage: false,
        Captain: false,
        DeclarationOfValue: false,
        NRT: false,
        GRT: false,
        isValid: function() {
            return true;
        },
        StartState: function() {
            this.BOLStatus = BOLObject.status;
            this.FreightTerm = BOLObject.freightTerms;
            this.CarrierBookingRef = BOLObject.carrierBookingRef;
            this.ExportRef = BOLObject.exportReference;
            this.Forwarder = BOLObject.forwarder.name;
            this.ForwarderAccount = BOLObject.forwarder.address;
            this.ForwarderName = BOLObject.forwarder.contact.name;
            this.ForwarderEmail = BOLObject.forwarder.contact.email;
            this.ForwarderPhone = BOLObject.forwarder.contact.phone;
            this.ForwarderFax = BOLObject.forwarder.contact.fax;
            this.Shipper = BOLObject.shipper.name;
            this.ShipperAccount = BOLObject.shipper.address;
            this.ShipperName = BOLObject.shipper.contact.name;
            this.ShipperEmail = BOLObject.shipper.contact.email;
            this.ShipperPhone = BOLObject.shipper.contact.phone;
            this.ShipperFax = BOLObject.shipper.contact.fax;
            this.Consignee = BOLObject.consignee.name;
            this.ConsigneeAccount = BOLObject.consignee.address;
            this.ConsigneeName = BOLObject.consignee.contact.name;
            this.ConsigneeEmail = BOLObject.consignee.contact.email;
            this.ConsigneePhone = BOLObject.consignee.contact.phone;
            this.ConsigneeFax = BOLObject.consignee.contact.fax;
            this.Notify = BOLObject.notifyParty.name;
            this.NotifyAccount = BOLObject.notifyParty.address;
            this.NotifyName = BOLObject.notifyParty.contact.name;
            this.NotifyEmail = BOLObject.notifyParty.contact.email;
            this.NotifyPhone = BOLObject.notifyParty.contact.phone;
            this.NotifyFax = BOLObject.notifyParty.contact.fax;
            this.POL = BOLObject.POL;
            this.POD = BOLObject.POD;
            this.Vessel = BOLObject.vessel;
            this.Voyage = BOLObject.voyageNum;
            this.Captain = BOLObject.captain;
            this.DeclarationOfValue = BOLObject.declarationOfValue;
            this.NRT = BOLObject.NRT;
            this.GRT = BOLObject.GRT;
        }
    };
    const CargoState = {
        Cargo: [],
        StartState: function() {
            this.Cargo = [];
            BOLObject.cargo.forEach(item => {
                this.Cargo.push(item);
            });
        },
        isValid: function() {
            return true;
        }
    };
    const RateState = {
        CargoRates: [],
        BOLRates: [],
        StartState: function() {
            this.CargoRates = [];
            this.BOLRates = [];
            BOLObject.setTotalRates();
            BOLObject.cargoRates.forEach(item => {
                this.CargoRates.push(item);
            });
            BOLObject.BOLRates.forEach(item => {
                this.BOLRates.push(item);
            });
        },
        isValid: function() {
            return true;
        }
    };
    const OptionState = {
        ShowCBM: true,
        ShowWeights: true,
        ShowFreightForwarder: true,
        Freighted: true,
        RoundWeight: 2,
        RoundCBM: 2,
        StartState: function() {
            this.ShowCBM = BOLObject.showCBM ? BOLObject.showCBM : true;
            this.ShowWeights = BOLObject.showWeights ? BOLObject.showWeights : true;
            this.ShowFreightForwarder = BOLObject.showFreightForwarder ? BOLObject.showFreightForwarder : true;
            this.Freighted = BOLObject.freighted ? BOLObject.freighted : true;
            this.RoundWeight = BOLObject.roundWeight ? BOLObject.roundWeight : 2;
            this.RoundCBM = BOLObject.roundCBM ? BOLObject.roundCBM : 2;
        }
    }

    // if(CommercialTable.rows('.selected').data().length < 1) {
    //     $('#CommercialCreateMastersNoCargoError').show();
    //     $('#CommercialCreateMastersNoCargoError').delay(3000).fadeOut(1000);
    //     return;
    // } else {
    //     //Checking if all the cargo selected can be allowed on the same BL
    //     for(let i = 0; i < CommercialTable.rows('.selected').data().length - 1; i++) {
    //         if(CommercialTable.rows('.selected').data()[i].bookingNumber !== CommercialTable.rows('.selected').data()[i + 1].bookingNumber
    //         || CommercialTable.rows('.selected').data()[i].POL.port.id !== CommercialTable.rows('.selected').data()[i + 1].POL.port.id
    //         || CommercialTable.rows('.selected').data()[i].POD.port.id !== CommercialTable.rows('.selected').data()[i + 1].POD.port.id) {
    //             $('#CommercialCreateMastersBadCargoError').show();
    //             $('#CommercialCreateMastersBadCargoError').delay(3000).fadeOut(1000);
    //             return;
    //         }
    //     }
    // }

    // BOLObject.carrierBookingRef = CommercialTable.rows('.selected').data()[0].bookingNumber;
    // BOLObject.POL = CommercialTable.rows('.selected').data()[0].POL.port;
    // BOLObject.POD = CommercialTable.rows('.selected').data()[0].POD.port;
    // BOLObject.consignee = CommercialTable.rows('.selected').data()[0].consignee;
    // BOLObject.forwarder = CommercialTable.rows('.selected').data()[0].forwarder;
    // BOLObject.vessel = CommercialTable.rows('.selected').data()[0].POL.vessel;
    // BOLObject.voyageNum = CommercialTable.rows('.selected').data()[0].POL.voyageNum;
    // for(let i = 0; i < CommercialTable.rows('.selected').data().length; i++) {
    //     BOLObject.cargo.push(CommercialTable.rows('.selected').data()[i]);
    // };

    $('#CommercialMastersModal').modal('show');
    showModalTabGeneral();

    function showModalTabGeneral() {
        GeneralState.StartState();
        //Setting the template
        $('#CommercialMastersBody').html($('#CommercialMastersGeneralTabTemplate').html());
        //Setting text on submit button to be submit or next
        $('#CreateCommercialMastersBtn').html('Next');
        //Change btn-secondary and btn-primary on the tabs
        $('#CommercialMastersGeneralTab').removeClass('btn-secondary');
        $('#CommercialMastersGeneralTab').addClass('btn-primary');
        $('#CommercialMastersGeneralTab').off('click');
        $('#CommercialMastersGeneralTab').on('click', () => {
            showModalTabGeneral();
        });
        $('#CommercialMastersCargoTab').removeClass('btn-primary');
        $('#CommercialMastersCargoTab').addClass('btn-secondary');
        $('#CommercialMastersCargoTab').off('click');
        $('#CommercialMastersCargoTab').on('click', () => {
            showModalTabCargo();
        });
        $('#CommercialMastersRatesTab').removeClass('btn-primary');
        $('#CommercialMastersRatesTab').addClass('btn-secondary');
        $('#CommercialMastersRatesTab').off('click');
        $('#CommercialMastersRatesTab').on('click', () => {
            showModalTabRates();
        });
        $('#CommercialMastersOptionsTab').removeClass('btn-primary');
        $('#CommercialMastersOptionsTab').addClass('btn-secondary');
        $('#CommercialMastersOptionsTab').off('click');
        $('#CommercialMastersOptionsTab').on('click', () => {
            showModalTabOptions();
        });

        //Setting up BOL Status
        $('#CMBOLStatus').html('');
        BOLStatuses.forEach(item => {
            $('#CMBOLStatus').append(`<option value="${item.id}">${item.description}</option>`);
        });
        $('#CMBOLStatus').off('change');
        $('#CMBOLStatus').on('change', () => {
            GeneralState.BOLStatus = $('#CMBOLStatus').val();
        });
        //Setting up Freight Terms
        $('#CMGeneralFreightTerms').html('');
        freightTerms.forEach(item => {
            $('#CMGeneralFreightTerms').append(`<option value="${item.id}">${item.freightTerm}</option>`);
        })
        $('#CMGeneralFreightTerms').off('change');
        $('#CMGeneralFreightTerms').on('change', () => {
            GeneralState.FreightTerm = $('#CMGeneralFreightTerms').val();
        });
        //Carrier Booking Ref
        $('#CMCarrierBookingRef').off('change');
        $('#CMCarrierBookingRef').on('change', () => {
            GeneralState.CarrierBookingRef = $('#CMCarrierBookingRef').val();
        });
        //Export Ref
        $('#CMExportRef').off('change');
        $('#CMExportRef').on('change', () => {
            GeneralState.ExportRef = $('#CMExportRef').val();
        });
        //Forwarder
        $("#CMForwarder").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#CMForwarder').val();
                });
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#CMForwarderError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Forwarder = $('#CMForwarder').val();
                    populateAccountDiv(customer[0], 'Forwarder');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#CMForwarderAccountDiv').html('');
                    $('#CMForwarderError').text(`There are multiple customers named '${$('#CMForwarder').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Forwarder = false;
                //If no customers are found
                } else {
                    $('#CMForwarderAccountDiv').html('');
                    $('#CMForwarderError').text(`'${$('#CMForwarder').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Forwarder = false;
                }
            }
        });
        $("#CMForwarder").autocomplete('widget').css('z-index', 2000);
        $('#CMForwarderName').off('change');
        $('#CMForwarderName').on('change', function() {
            GeneralState.ForwarderName = $(this).val();
        });
        $('#CMForwarderEmail').off('change');
        $('#CMForwarderEmail').on('change', function() {
            GeneralState.ForwarderEmail = $(this).val();
        });
        $('#CMForwarderPhone').off('change');
        $('#CMForwarderPhone').on('change', function() {
            GeneralState.ForwarderPhone = $(this).val();
        });
        $('#CMForwarderFax').off('change');
        $('#CMForwarderFax').on('change', function() {
            GeneralState.ForwarderFax = $(this).val();
        });
        //Shipper
        $("#CMShipper").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#CMShipper').val();
                });
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#CMShipperError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Shipper = $('#CMShipper').val();
                    populateAccountDiv(customer[0], 'Shipper');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#AccountDiv').html('');
                    $('#CMShipperError').text(`There are multiple customers named '${$('#CMShipper').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Shipper = false;
                //If no customers are found
                } else {
                    $('#AccountDiv').html('');
                    $('#CMShipperError').text(`'${$('#CMShipper').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Shipper = false;
                }
            }
        });
        $("#CMShipper").autocomplete('widget').css('z-index', 2000);
        $('#CMShipperName').off('change');
        $('#CMShipperName').on('change', function() {
            GeneralState.ShipperName = $(this).val();
        });
        $('#CMShipperEmail').off('change');
        $('#CMShipperEmail').on('change', function() {
            GeneralState.ShipperEmail = $(this).val();
        });
        $('#CMShipperPhone').off('change');
        $('#CMShipperPhone').on('change', function() {
            GeneralState.ShipperPhone = $(this).val();
        });
        $('#CMShipperFax').off('change');
        $('#CMShipperFax').on('change', function() {
            GeneralState.ShipperFax = $(this).val();
        });
        //Consignee
        $("#CMConsignee").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#CMConsignee').val();
                })
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#CMConsigneeError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Consignee = $('#CMConsignee').val();
                    populateAccountDiv(customer[0], 'Consignee');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#CMConsigneeAccountDiv').html('');
                    $('#CMConsigneeError').text(`There are multiple customers named '${$('#CMConsignee').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Consignee = false;
                //If no customers are found
                } else {
                    $('#CMConsigneeAccountDiv').html('');
                    $('#CMConsigneeError').text(`'${$('#CMConsignee').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Consignee = false;
                }
            }
        });
        $("#CMConsignee").autocomplete('widget').css('z-index', 2000);
        $('#CMConsigneeName').off('change');
        $('#CMConsigneeName').on('change', function() {
            GeneralState.ConsigneeName = $(this).val();
        });
        $('#CMConsigneeEmail').off('change');
        $('#CMConsigneeEmail').on('change', function() {
            GeneralState.ConsigneeEmail = $(this).val();
        });
        $('#CMConsigneePhone').off('change');
        $('#CMConsigneePhone').on('change', function() {
            GeneralState.ConsigneePhone = $(this).val();
        });
        $('#CMConsigneeFax').off('change');
        $('#CMConsigneeFax').on('change', function() {
            GeneralState.ConsigneeFax = $(this).val();
        });
        //Notify Party
        $("#CMNotify").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#CMNotify').val();
                })
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#CMNotifyError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Notify = $('#CMNotify').val();
                    populateAccountDiv(customer[0], 'Notify');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#CMNotifyAccountDiv').html('');
                    $('#CMNotifyError').text(`There are multiple customers named '${$('#CMNotify').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Notify = false;
                //If no customers are found
                } else {
                    $('#CMNotifyAccountDiv').html('');
                    $('#CMNotifyError').text(`'${$('#CMNotify').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Notify = false;
                }
            }
        });
        $("#CMNotify").autocomplete('widget').css('z-index', 2000);
        $('#CMNotifyName').off('change');
        $('#CMNotifyName').on('change', function() {
            GeneralState.NotifyName = $(this).val();
        });
        $('#CMNotifyEmail').off('change');
        $('#CMNotifyEmail').on('change', function() {
            GeneralState.NotifyEmail = $(this).val();
        });
        $('#CMNotifyPhone').off('change');
        $('#CMNotifyPhone').on('change', function() {
            GeneralState.NotifyPhone = $(this).val();
        });
        $('#CMNotifyFax').off('change');
        $('#CMNotifyFax').on('change', function() {
            GeneralState.NotifyFax = $(this).val();
        });
        //POL
        $("#CMPOL").autocomplete({
            source: ports,
            change: function( event, ui ) {
                //Filters through ports to see if port name entered is valid
                let port = ports.filter(port => {
                    return port.Name === $('#CMPOL').val();
                });
                //If 1 port is found
                if(port.length === 1) {
                    $('#CMPOLError').text("");
                    GeneralState.POL = new Port3(port[0]);
                    $('#CMPOL').val(GeneralState.POL.Name);
                    if($('#CMPOL').val() == $('#CMPOD').val()) {
                        $('.POLPODSameError').text('POL and POD can not be the same!');
                    } else {
                        $('.POLPODSameError').text('');
                    }
                //If more than 1 port is found
                } else if(port.length > 1){
                    $('#CMPOLError').text(`There are multiple ports named '${$('#CMPOL').val()}'. Contact the IT Department for help!`);
                    GeneralState.POL = false;
                //If no ports are found
                } else {
                    $('#CMPOLError').text(`'${$('#CMPOL').val()}' is not a valid port! Either type the name in correctly or Choose one from the dropdown!`);
                    GeneralState.POL = false;
                }
            }
        });
        $("#CMPOL").autocomplete('widget').css('z-index', 2000);
        //POD
        $("#CMPOD").autocomplete({
            source: ports,
            change: function( event, ui ) {
                //Filters through ports to see if port name entered is valid
                let port = ports.filter(port => {
                    return port.Name === $('#CMPOD').val();
                });
                //If 1 port is found
                if(port.length === 1) {
                    $('#CMPODError').text("");
                    GeneralState.POD = new Port3(port[0]);
                    $('#CMPOD').val(GeneralState.POD.Name);
                    if($('#CMPOL').val() == $('#CMPOD').val()) {
                        $('.POLPODSameError').text('POL and POD can not be the same!');
                    } else {
                        $('.POLPODSameError').text('');
                    }
                //If more than 1 port is found
                } else if(port.length > 1){
                    $('#CMPODError').text(`There are multiple ports named '${$('#CMPOD').val()}'. Contact the IT Department for help!`);
                    GeneralState.POL = false;
                //If no ports are found
                } else {
                    $('#CMPODError').text(`'${$('#CMPOD').val()}' is not a valid port! Either type the name in correctly or Choose one from the dropdown!`);
                    GeneralState.POL = false;
                }
            }
        });
        $("#CMPOD").autocomplete('widget').css('z-index', 2000);
        //Vessel
        $("#CMVessel").autocomplete({
            source: vessels,
            change: function( event, ui ) {
                //Filters through vessels to see if vessel name entered is valid
                let vessel = vessels.filter(vessel => {
                    return vessel.Name === $('#CMVessel').val();
                })
                //If 1 vessel is found
                if(vessel.length === 1) {
                    $('#CMVesselError').text("");
                    GeneralState.Vessel = new Vessel3(vessel[0]);
                    $('#CMVessel').val(GeneralState.Vessel.Name);
                //If more than 1 vessel is found
                } else if(vessel.length > 1){
                    $('#CMVesselError').text(`There are multiple vessels named '${$('#CMVessel').val()}'. Contact the IT Department for help!`);
                    GeneralState.Vessel = false;
                //If no vessels are found
                } else {
                    $('#CMVesselError').text(`'${$('#CMVessel').val()}' is not a valid vessel! Either type the name in correctly or Choose one from the dropdown!`);
                    GeneralState.Vessel = false;
                }
            }
        });
        $("#CMVessel").autocomplete('widget').css('z-index', 2000); 
        //Voyage
        $('#CMVoyage').off('change');
        $('#CMVoyage').on('change', () => {
            if(parseInt($('#CMVoyage')) < 0) {
                $('#CMVoyageError').text('Voyage Number can not be below 0!');
                GeneralState.Voyage = false;
            } else {
                $('#CMVoyageError').text('');
                GeneralState.Voyage = $('#CMVoyage').val();
            }
        });
        //Captain
        $('#CMCaptain').off('change');
        $('#CMCaptain').on('change', () => {
            GeneralState.Captain = $('#CMCaptain').val();
        });
        //Declaration Of Value
        $('#CMDeclarationOfValue').off('change');
        $('#CMDeclarationOfValue').on('change', () => {
            GeneralState.DeclarationOfValue = $('#CMDeclarationOfValue').val();
        }); 
        //NRT
        $('#CMNRT').off('change');
        $('#CMNRT').on('change', () => {
            GeneralState.NRT = $('#CMNRT').val();
        });
        //GRT
        $('#CMGRT').off('change');
        $('#CMGRT').on('change', () => {
            GeneralState.GRT = $('#CMGRT').val();
        });
        //Submit Button
        $('#CreateCommercialMastersBtn').off('click');
        $('#CreateCommercialMastersBtn').on('click', () => {
            if(GeneralState.isValid()) {
                saveGeneralTab();
                showModalTabCargo();
            }
        });
        accountOnClick();
        loadGeneralTab();


        function loadGeneralTab() {
            $('#CMBOLStatus').val(GeneralState.BOLStatus);
            $('#CMBOLStatus').change();
            $('#CMGeneralFreightTerms').val(GeneralState.FreightTerm);
            $('#CMGeneralFreightTerms').change();
            $('#CMCarrierBookingRef').val(GeneralState.CarrierBookingRef);
            $('#CMCarrierBookingRef').change();
            $('#CMExportRef').val(GeneralState.ExportRef);
            $('#CMExportRef').change();
            //Forwarder
            $('#CMForwarder').val(GeneralState.Forwarder);
            let customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Forwarder;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Forwarder'); 
                $(`input[accountType="Forwarder"][value="${GeneralState.ForwarderAccount.accountId}"]`).attr('checked', true);
            }
            $('#CMForwarderName').val(GeneralState.ForwarderName);
            $('#CMForwarderEmail').val(GeneralState.ForwarderEmail);
            $('#CMForwarderPhone').val(GeneralState.ForwarderPhone);
            $('#CMForwarderFax').val(GeneralState.ForwarderFax);
            //Shipper
            $('#CMShipper').val(GeneralState.Shipper);
            customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Shipper;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Shipper'); 
                $(`input[accountType="Shipper"][value="${GeneralState.ShipperAccount.accountId}"]`).attr('checked', true);
            }
            $('#CMShipperName').val(GeneralState.ShipperName);
            $('#CMShipperEmail').val(GeneralState.ShipperEmail);
            $('#CMShipperPhone').val(GeneralState.ShipperPhone);
            $('#CMShipperFax').val(GeneralState.ShipperFax);
            //Consignee
            $('#CMConsignee').val(GeneralState.Consignee);
            customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Consignee;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Consignee'); 
                $(`input[accountType="Consignee"][value="${GeneralState.ConsigneeAccount.accountId}"]`).attr('checked', true);
            }
            $('#CMConsigneeName').val(GeneralState.ConsigneeName);
            $('#CMConsigneeEmail').val(GeneralState.ConsigneeEmail);
            $('#CMConsigneePhone').val(GeneralState.ConsigneePhone);
            $('#CMConsigneeFax').val(GeneralState.ConsigneeFax);
            //Notify Party
            $('#CMNotify').val(GeneralState.Notify);
            customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Notify;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Notify'); 
                $(`input[accountType="Notify"][value="${GeneralState.NotifyAccount.accountId}"]`).attr('checked', true);
            }
            $('#CMNotifyName').val(GeneralState.NotifyName);
            $('#CMNotifyEmail').val(GeneralState.NotifyEmail);
            $('#CMNotifyPhone').val(GeneralState.NotifyPhone);
            $('#CMNotifyFax').val(GeneralState.NotifyFax);
            $('#CMPOL').val(GeneralState.POL.Name);
            $('#CMPOL').change();
            $('#CMPOD').val(GeneralState.POL.Name);
            $('#CMPOD').change();
            $('#CMVessel').val(GeneralState.Vessel.Name);
            $('#CMVessel').change(); 
            $('#CMVoyage').val(GeneralState.Voyage);
            $('#CMVoyage').change(); 
            $('#CMCaptain').val(GeneralState.Captain);
            $('#CMCaptain').change(); 
            $('#CMDeclarationOfValue').val(GeneralState.DeclarationOfValue);
            $('#CMDeclarationOfValue').change();
            $('#CMNRT').val(GeneralState.NRT);
            $('#CMNRT').change(); 
            $('#CMGRT').val(GeneralState.GRT);
            $('#CMGRT').change();
        }
        //Helper Functions
        //Helper Function for loading the addresses once the customer has been selected
        function populateAccountDiv(customer, account){
            $(`#CM${account}AccountDiv`).html('');
            for (var i = 0; i < customer.accountList.length; i++) {
                $(`#CM${account}AccountDiv`).append(
                    `<div class="form-check mt-1 mb-1">
                        <input id="${account}AccountRadios${customer.accountList[i].accountID}" class="form-check-input AccountRadios" type="radio" value="${customer.accountList[i].accountID}" accountType="${account}" name="${account}AccountRadios" customer="${customer.customerID}">
                        <label class="form-check-label" for="${account}AccountRadios${customer.accountList[i].accountID}">
                            ${getAddressFromAccount(customer.accountList[i])}
                        </label>
                    </div>`
                );
            }
            accountOnClick();
            //Helper Function for populateAccountDiv()
            //Creates the Address String with Account Name(If applicable) and returns it
            function getAddressFromAccount(account) {
                return `${account.accountName ? account.accountName + ": <br><p class='pl-3 mb-0' style='font-size:85%'>" : "<p class='mb-0'>"}
                        ${account.address1}, ${account.city} ${account.state} ${account.zip}, 
                        ${account.country}${account.accountName ? '</p>' : "</p>"}`;
            }
        }
        function accountOnClick() {
            $('.AccountRadios').off('click');
            $('.AccountRadios').on('click', function() {
                const tmpCustomer = customerList.filter(item => {
                    return item.customerID == $(this).attr('customer');
                })[0];
                const tmpAccount = tmpCustomer.accountList.filter(item => {
                    return item.accountID == $(this).attr('value');
                })[0];
                const tmpAddress = new Account3({
                    accountId: tmpAccount.accountID ? tmpAccount.accountID : null,
                    accountName: tmpAccount.accountName ? tmpAccount.accountName : null,
                    address1: tmpAccount.address1 ? tmpAccount.address1 : null,
                    address2: tmpAccount.address2 ? tmpAccount.address2 : null,
                    addressId: tmpAccount.addressID ? tmpAccount.addressID : null,
                    addressTypeId: tmpAccount.addressTypeID ? tmpAccount.addressTypeID : null,
                    city: tmpAccount.city ? tmpAccount.city : null,
                    country: tmpAccount.country ? tmpAccount.country : null,
                    state: tmpAccount.state ? tmpAccount.state : null,
                    zip: tmpAccount.zip ? tmpAccount.zip : null
                });
                switch($(this).attr('accountType')) {
                    case 'Forwarder':
                        GeneralState.ForwarderAccount = tmpAddress;
                        break;
                    case 'Shipper':
                        GeneralState.ShipperAccount = tmpAddress;
                        break;
                    case 'Consignee':
                        GeneralState.ConsigneeAccount = tmpAddress;
                        break;
                    case 'Notify':
                        GeneralState.NotifyAccount = tmpAddress;
                        break;
                }
            });
        }
    }
    function saveGeneralTab() {
        BOLObject.status = GeneralState.BOLStatus;
        BOLObject.freightTerms = GeneralState.FreightTerm;
        BOLObject.carrierBookingRef = GeneralState.CarrierBookingRef;
        BOLObject.exportReference = GeneralState.ExportRef;
        BOLObject.forwarder.name = GeneralState.Forwarder;
        BOLObject.forwarder.address = GeneralState.ForwarderAccount;
        BOLObject.forwarder.contact.name = GeneralState.ForwarderName;
        BOLObject.forwarder.contact.email = GeneralState.ForwarderEmail;
        BOLObject.forwarder.contact.phone  = GeneralState.ForwarderPhone;
        BOLObject.forwarder.contact.fax = GeneralState.ForwarderFax;
        BOLObject.consignee.name = GeneralState.Consignee;
        BOLObject.consignee.address = GeneralState.ConsigneeAccount;
        BOLObject.consignee.contact.name = GeneralState.ConsigneeName;
        BOLObject.consignee.contact.email = GeneralState.ConsigneeEmail;
        BOLObject.consignee.contact.phone = GeneralState.ConsigneePhone;
        BOLObject.consignee.contact.fax = GeneralState.ConsigneeFax;
        BOLObject.notifyParty.name = GeneralState.Notify;
        BOLObject.notifyParty.address = GeneralState.NotifyAccount;
        BOLObject.notifyParty.contact.name = GeneralState.NotifyName;
        BOLObject.notifyParty.contact.email = GeneralState.NotifyEmail;
        BOLObject.notifyParty.contact.phone = GeneralState.NotifyPhone;
        BOLObject.notifyParty.contact.fax = GeneralState.NotifyFax;
        BOLObject.shipper.name = GeneralState.Shipper;
        BOLObject.shipper.address = GeneralState.ShipperAccount;
        BOLObject.shipper.contact.name = GeneralState.ShipperName;
        BOLObject.shipper.contact.email = GeneralState.ShipperEmail;
        BOLObject.shipper.contact.phone = GeneralState.ShipperPhone;
        BOLObject.shipper.contact.fax = GeneralState.ShipperFax;
        BOLObject.POL = GeneralState.POL;
        BOLObject.POD = GeneralState.POD;
        BOLObject.vessel = GeneralState.Vessel;
        BOLObject.voyageNum = GeneralState.Voyage;
        BOLObject.captain = GeneralState.Captain;
        BOLObject.declarationOfValue = GeneralState.DeclarationOfValue;
        BOLObject.NRT = GeneralState.NRT;
        BOLObject.GRT = GeneralState.GRT;
    }
    function showModalTabCargo() {
        CargoState.StartState();
        //Setting the template
        $('#CommercialMastersBody').html($('#CommercialMastersCargoTabTemplate').html());
        //Change btn-secondary and btn-primary on the tabs
        $('#CommercialMastersGeneralTab').removeClass('btn-primary');
        $('#CommercialMastersGeneralTab').addClass('btn-secondary');
        $('#CommercialMastersGeneralTab').off('click');
        $('#CommercialMastersGeneralTab').on('click', () => {
            showModalTabGeneral();
        });
        $('#CommercialMastersCargoTab').removeClass('btn-secondary');
        $('#CommercialMastersCargoTab').addClass('btn-primary');
        $('#CommercialMastersCargoTab').off('click');
        $('#CommercialMastersCargoTab').on('click', () => {
            showModalTabCargo();
        });
        $('#CommercialMastersRatesTab').removeClass('btn-primary');
        $('#CommercialMastersRatesTab').addClass('btn-secondary');
        $('#CommercialMastersRatesTab').off('click');
        $('#CommercialMastersRatesTab').on('click', () => {
            showModalTabRates();
        });
        $('#CommercialMastersOptionsTab').removeClass('btn-primary');
        $('#CommercialMastersOptionsTab').addClass('btn-secondary');
        $('#CommercialMastersOptionsTab').off('click');
        $('#CommercialMastersOptionsTab').on('click', () => {
            showModalTabOptions();
        });

        //Setting text on submit button to be submit or next
        $('#CreateCommercialMastersBtn').html('Next');
        $('#CreateCommercialMastersBtn').off('click');
        $('#CreateCommercialMastersBtn').on('click', () => {
            saveCargoTab();
            showModalTabRates();
        });
        //Add Cargo Button
        $('#CMAddCargoBtn').off('click');
        $('#CMAddCargoBtn').on('click', () => {
            openAddCargoModal();
        });
        drawTable();

        function openAddCargoModal() {
            $('#CommercialMastersAddCargoModal').modal('show');
            //Fading in/out the original modal
            $('#CommercialMastersAddCargoModal').on('hidden.bs.modal', function () {
                $('#CommercialMastersModal').attr('style', '9999; display: block;');
            })
            $('#CommercialMastersModal').attr('style', 'z-index: 999; display: block;');

            //Filtering the available cargo to select
            const filteredCargo = commercialCargo.filter(item => {
                if(item.bookingNumber == BOLObject.carrierBookingRef
                && item.POL.port.id == BOLObject.POL.id
                && item.POD.port.id == BOLObject.POD.id) {
                    let tmp = true;
                    for(let i = 0; i < CargoState.Cargo.length; i++) {
                        if(CargoState.Cargo[i].id == item.id) {
                            tmp = false;
                        }
                    }
                    if(tmp){
                        return item;
                    }
                }
            });

            const AddCargoTable = $('#CMAddCargoTable').DataTable({
                destroy: true,
                paging: false,
                searching: false,
                scrollX: true,
                scrollY: '40vh',
                select: {
                    style: 'multi',   
                },
                data: filteredCargo,
                columns: [
                    //VIN
                    {
                        data: 'VIN',
                        render: function(data) {
                            return data;
                        }
                    },
                    //Booking Number
                    {
                        data: 'bookingNumber',
                        render: function(data) {
                            return data;
                        }
                    },
                    //CargoStatus
                    {
                        data: 'cargoStatus',
                        render: function(data) {
                            return readReferenceTables(cargoStatuses, data).description;
                        }
                    },
                    //Description
                    {
                        data: 'cargoDescription',
                        render: function(data) {
                            return data;
                        }
                    },
                    //Forwarder
                    {
                        data: 'forwarder',
                        render: function(data) {
                            return data ? data.name : 'N/A';
                        }
                    }
                ]
            });

            $('#CMSubmitAddCargoBtn').off('click');
            $('#CMSubmitAddCargoBtn').on('click', () => {
                for(let i = 0; i < AddCargoTable.rows('.selected').data().length; i++) {
                    let tmp = CargoState.Cargo.findIndex(item => {
                        return item.id == AddCargoTable.rows('.selected').data()[i].id;
                    });
                    if(tmp == -1) {
                        switch(AddCargoTable.rows('.selected').data()[i].customerType) {
                            case 'M':
                                CargoState.Cargo.push(new MilitaryCargo3(AddCargoTable.rows('.selected').data()[i]));
                                break;
                            case 'C':
                                CargoState.Cargo.push(new CommercialCargo3(AddCargoTable.rows('.selected').data()[i]));
                                break;
                        }
                    }
                }
                $('#CommercialMastersAddCargoModal').modal('hide');
                drawTable();
            });
        }
        //Draws the table as well as onclicks for removing cargo
        function drawTable() {
            //Setting up the Cargo Table
            $('#CMCargoTable').DataTable({
                destroy: true,
                paging: false,
                searching: false,
                scrollX: true,
                scrollY: '40vh',
                data: CargoState.Cargo,
                columns: [
                    //Remove
                    {
                        data: 'id',
                        className: 'align-middle',
                        render: function(data) {
                            return `<button class="CMCargoTableRemoveCargoBtn float-right btn btn-sm btn-outline-danger" cargoId="${data}"><i class="fas fa-times"></i></button>`;
                        }
                    },
                    //VIN
                    {
                        data: 'VIN',
                        render: function(data) {
                            return data;
                        }
                    },
                    //Description
                    {
                        data: 'cargoDescription',
                        render: function(data) {
                            return `<input cargoId="${data.id}" value="${data ? data : ''}" size="17">`;
                        }
                    },
                    //Length
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.lengths.inch).toFixed(1);
                        }
                    },
                    //Width
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.widths.inch).toFixed(1);
                        }
                    },
                    //Height
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.heights.inch).toFixed(1);
                        }
                    },
                    //Weight
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.weights.kg).toFixed(1);
                        }
                    },
                    //CBM
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.volumes.m).toFixed(1);
                        }
                    },
                    //AES ITN
                    {
                        data: function(row, type, val, meta) {
                            return row;
                        },
                        className: 'align-middle',
                        render: function(data) {
                            return `<input class="CMCargoTableAESITN" cargoId="${data.id}" value="${data.AESITN ? data.AESITN : ''}" size="10">`;
                        }
                    },
                    //HSCODE
                    {
                        data: function(row, type, val, meta) {
                            return row;
                        },
                        className: 'align-middle',
                        render: function(data) {
                            return `<input class="CMCargoTableHSCode" cargoId="${data.id}" value="${data.HSCode ? data.HSCode : ''}" size="10">`;
                        }
                    },
                    //Position
                    {
                        data: function(row, type, val, meta) {
                            return meta;
                        },
                        render: function(data) {
                            return `<button class="btn CMCargoPositionBtn" index="${data.row}" dir="up" ${data.row == 0 ? 'disabled' : ''}><i class="fas fa-angle-up"></i></button> <button class="btn CMCargoPositionBtn" index="${data.row}" dir="down" ${data.row == CargoState.Cargo.length - 1 ? 'disabled' : ''}><i class="fas fa-angle-down"></i></button>`;
                        }
                    }
                ]
            });
            //Set the on clicks and on changes and all that good stuff
            $('.CMCargoTableRemoveCargoBtn').off('click');
            $('.CMCargoTableRemoveCargoBtn').on('click', function() {
                let tmp = CargoState.Cargo.findIndex(item => {
                    return item.id == $(this).attr('cargoId');
                });
                if(tmp !== -1) {
                    CargoState.Cargo.splice(tmp, 1);
                }
                drawTable();
            });
            $('.CMCargoTableAESITN').off('change');
            $('.CMCargoTableAESITN').on('change', function() {
                let tmp = CargoState.Cargo.findIndex(item => {
                    return item.id == $(this).attr('cargoId');
                });
                if(tmp !== -1) {
                    CargoState.Cargo[tmp].AESITN = $(this).val();
                }
            });
            $('.CMCargoTableHSCode').off('change');
            $('.CMCargoTableHSCode').on('change', function() {
                let tmp = CargoState.Cargo.findIndex(item => {
                    return item.id == $(this).attr('cargoId');
                });
                if(tmp !== -1) {
                    CargoState.Cargo[tmp].HSCode = $(this).val();
                }
            });
            $('.CMCargoPositionBtn').off('click');
            $('.CMCargoPositionBtn').on('click', function() {
                let index = parseInt($(this).attr('index'));
                let tmpCargo = CargoState.Cargo[index];
                switch($(this).attr('dir')) {
                    case 'up':
                        CargoState.Cargo[index] = CargoState.Cargo[index - 1];
                        CargoState.Cargo[index - 1] = tmpCargo;
                        break;
                    case 'down':
                        CargoState.Cargo[index] = CargoState.Cargo[index + 1];
                        CargoState.Cargo[index + 1] = tmpCargo;
                        break;
                };
                console.log(CargoState);
                drawTable();
            })
        }
    }
    function saveCargoTab() {
        if(CargoState.isValid) {
            BOLObject.cargo = [];
            CargoState.Cargo.forEach(item => {
                BOLObject.cargo.push(item);
            });
        }
        console.log(BOLObject);
    }
    function showModalTabRates() {
        //Setting the template
        $('#CommercialMastersBody').html($('#CommercialMastersRatesTabTemplate').html());
        //Change btn-secondary and btn-primary on the tabs
        $('#CommercialMastersGeneralTab').removeClass('btn-primary');
        $('#CommercialMastersGeneralTab').addClass('btn-secondary');
        $('#CommercialMastersGeneralTab').off('click');
        $('#CommercialMastersGeneralTab').on('click', () => {
            showModalTabGeneral();
        });
        $('#CommercialMastersCargoTab').removeClass('btn-primary');
        $('#CommercialMastersCargoTab').addClass('btn-secondary');
        $('#CommercialMastersCargoTab').off('click');
        $('#CommercialMastersCargoTab').on('click', () => {
            showModalTabCargo();
        });
        $('#CommercialMastersRatesTab').removeClass('btn-secondary');
        $('#CommercialMastersRatesTab').addClass('btn-primary');
        $('#CommercialMastersRatesTab').off('click');
        $('#CommercialMastersRatesTab').on('click', () => {
            showModalTabRates();
        });
        $('#CommercialMastersOptionsTab').removeClass('btn-primary');
        $('#CommercialMastersOptionsTab').addClass('btn-secondary');
        $('#CommercialMastersOptionsTab').off('click');
        $('#CommercialMastersOptionsTab').on('click', () => {
            showModalTabOptions();
        });

        $('#CMAddRatesBtn').off('click');
        $('#CMAddRatesBtn').on('click', function() {
            openAddRatesModal();
        });

        //Setting text on submit button to be submit or next
        $('#CreateCommercialMastersBtn').html('Next');
        $('#CreateCommercialMastersBtn').off('click');
        $('#CreateCommercialMastersBtn').on('click', () => {
            showModalTabOptions();
        });

        RateState.StartState();

        $('#CMRatesTable').DataTable({
            destroy: true,
            data: RateState.CargoRates.concat(RateState.BOLRates),
            columns: [
                //Actions
                {
                    data: 'rateType',
                    render: function(data) {
                        return `
                        <button class="btn btn-sm">
                            <i class="fas fa-edit" title="Edit"></i>
                        </button>`
                    }
                },
                //Service
                {
                    data: 'rateType',
                    render: function(data) {
                        let tmp = rateFeeTypes.filter(item => {
                            return item.RateTypeId == data;
                        })[0];
                        return tmp.RateType;
                    }
                },
                //Rate Type
                {
                    data: 'unitType',
                    render: function(data) {
                        let tmp = rateFeeTypes.filter(item => {
                            return item.FeeTypeId == data;
                        })[0];
                        return tmp.FeeType;
                    }
                },
                //Rate
                {
                    data: 'rate',
                    render: function(data) {
                        return data;
                    }
                },
                //Quantity
                {
                    data: 'unitTypeAmount',
                    render: function(data) {
                        return data;
                    }
                },
                //Total
                {
                    data: 'cost',
                    render: function(data) {
                        return data;
                    }
                }
            ]
        });

        function openAddRatesModal() {
            $('#CommercialMastersAddRatesModal').modal('show');
            //Fading in/out the original modal
            $('#CommercialMastersAddRatesModal').on('hidden.bs.modal', function () {
                $('#CommercialMastersModal').attr('style', '9999; display: block;');
            })
            $('#CommercialMastersModal').attr('style', 'z-index: 999; display: block;');

            $('#AddRatesCargoTable').DataTable({
                destroy: true,
                paging: false,
                searching: false,
                data: BOLObject.cargo,
                select: {
                    style: 'multi',
                    items: 'row'
                },
                columns: [
                    //VIN
                    {
                        data: 'VIN',
                        render: function(data) {
                            return data;
                        }
                    },
                    //Description
                    {
                        data: 'cargoDescription',
                        render: function(data) {
                            return data;
                        }
                    },
                    //Cargo SubType
                    {
                        data: 'cargoSubType',
                        render: function(data) {
                            let tmp = cargoSubTypes.filter(item => {
                                return item.id == data;
                            })[0]
                            return tmp.ShortDesc;
                        }
                    },
                    //Length
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.lengths.inch).toFixed(1);
                        }
                    },
                    //Width
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.widths.inch).toFixed(1);
                        }
                    },
                    //Height
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.heights.inch).toFixed(1);
                        }
                    },
                    //Weight
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.weights.kg).toFixed(1);
                        }
                    },
                    //CBM
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.volumes.m).toFixed(1);
                        }
                    }
                ]

            })
            $('#CMAddRate').html('');
            const uniqueRates = [];
            rateFeeTypes.forEach(item => {
                let tmp = uniqueRates.findIndex(item2 => {
                    return item.RateTypeId == item2.RateTypeId;
                });
                if(tmp == -1) {
                    uniqueRates.push(item);
                }
            });
            uniqueRates.forEach(item => {
                $('#CMAddRate').append(`<option value="${item.RateTypeId}">${item.RateType}</option>`);
            })
        }
    }
    function showModalTabOptions() {
        OptionState.StartState();
        //Setting the template
        $('#CommercialMastersBody').html($('#CommercialMastersOptionsTabTemplate').html());
        //Change btn-secondary and btn-primary on the tabs
        $('#CommercialMastersGeneralTab').removeClass('btn-primary');
        $('#CommercialMastersGeneralTab').addClass('btn-secondary');
        $('#CommercialMastersGeneralTab').off('click');
        $('#CommercialMastersGeneralTab').on('click', () => {
            showModalTabGeneral();
        });
        $('#CommercialMastersCargoTab').removeClass('btn-primary');
        $('#CommercialMastersCargoTab').addClass('btn-secondary');
        $('#CommercialMastersCargoTab').off('click');
        $('#CommercialMastersCargoTab').on('click', () => {
            showModalTabCargo();
        });
        $('#CommercialMastersRatesTab').removeClass('btn-primary');
        $('#CommercialMastersRatesTab').addClass('btn-secondary');
        $('#CommercialMastersRatesTab').off('click');
        $('#CommercialMastersRatesTab').on('click', () => {
            showModalTabRates();
        });
        $('#CommercialMastersOptionsTab').removeClass('btn-secondary');
        $('#CommercialMastersOptionsTab').addClass('btn-primary');
        $('#CommercialMastersOptionsTab').off('click');
        $('#CommercialMastersOptionsTab').on('click', () => {
            showModalTabOptions();
        });

        $('#CMShowCBM').off('change');
        $('#CMShowCBM').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.ShowCBM = true;
            } else {
                OptionState.ShowCBM = false;
            }
        });
        $('#CMShowWeights').off('change');
        $('#CMShowWeights').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.ShowWeights = true;
            } else {
                OptionState.ShowWeights = false;
            }
        });
        $('#CMShowFreightForwarder').off('change');
        $('#CMShowFreightForwarder').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.ShowFreightForwarder = true;
            } else {
                OptionState.ShowFreightForwarder = false;
            }
        });
        $('#CMFreighted').off('change');
        $('#CMFreighted').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.Freighted = true;
            } else {
                OptionState.Freighted = false;
            }
        });
        $('#CMRoundWeight').off('change');
        $('#CMRoundWeight').on('change', function() {
            OptionState.RoundWeight = $(this).val();
        });
        $('#CMRoundCBM').off('change');
        $('#CMRoundCBM').on('change', function() {
            OptionState.RoundCBM = $(this).val();
        });

        //Setting text on submit button to be submit or next
        $('#CreateCommercialMastersBtn').html('Submit');
        $('#CreateCommercialMastersBtn').off('click');
        $('#CreateCommercialMastersBtn').on('click', () => {
            saveOptionsTab();
            insertMasters();
        });

        loadOptionsTab();

        function loadOptionsTab() {
            if(OptionState.ShowCBM) {
                $('#CMShowCBM').prop('checked', true);
            } else {
                $('#CMShowCBM').prop('checked', false);
            }
            if(OptionState.ShowWeights) {
                $('#CMShowWeights').prop('checked', true);
            } else {
                $('#CMShowWeights').prop('checked', false);
            }
            if(OptionState.ShowFreightForwarder) {
                $('#CMShowFreightForwarder').prop('checked', true);
            } else {
                $('#CMShowFreightForwarder').prop('checked', false);
            }
            if(OptionState.Freighted) {
                $('#CMFreighted').prop('checked', true);
            } else {
                $('#CMFreighted').prop('checked', false);
            }
            $('#CMRoundWeight').val(OptionState.RoundWeight);
            $('#CMRoundCBM').val(OptionState.RoundCBM);
        }
    }
    function saveOptionsTab() {
        BOLObject.showCBM = OptionState.ShowCBM ? OptionState.ShowCBM : false;
        BOLObject.showWeights = OptionState.ShowWeights ? OptionState.ShowWeights : false;
        BOLObject.showFreightForwarder = OptionState.ShowFreightForwarder ? OptionState.ShowFreightForwarder : false;
        BOLObject.freighted = OptionState.Freighted ? OptionState.Freighted : false;
        BOLObject.roundWeight = OptionState.RoundWeight ? OptionState.RoundWeight : 2;
        BOLObject.roundCBM = OptionState.RoundCBM ? OptionState.RoundCBM : 2;
    }
    function insertMasters() {
        console.log(BOLObject);
        let jsonDoc = { "jsondoc": JSON.stringify(BOLObject), "username": 'qatester'};
        console.log(jsonDoc);

        $.ajax({
            url: api.insertBOLTransaction.url,
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(jsonDoc),
            headers: api.insertBOLTransaction.key,
            processData: false,
            success: function( data, textStatus, xhr ){
                console.log(data);
                $('#CommercialMastersModal').modal('hide');
            },
            error: function(xhr, textStatus, errorThrown ){
                console.log( {errorThrown} );
                alert("Error inserting booking transaction account: " + textStatus + " : " + errorThrown);
            },
            complete: function(){
                //Disabling the Insert Booking Spinner
                // $('#createBookingSpinner').css('display','none');
                // $('#createBookingButton').removeAttr('disabled');
                readCargo();
                readBillsOfLading();
            }
        });
    }
}

function openEditCommercialCargoModal() {
    const CargoToEdit = [];

    CommercialTable.rows('.selected').data();
    for(let i = 0; i < CommercialTable.rows('.selected').data().length; i++) {
        CargoToEdit.push(new CommercialCargo3(CommercialTable.rows('.selected').data()[i]));
    }

    if(CargoToEdit.length < 1) {
        $('#CommercialEditCargoError').show();
        $('#CommercialEditCargoError').delay(3000).fadeOut(1000);
        return;
    }

    $('#CommercialEditCargoModal').modal('show');
    $('#CommercialEditCargoCargo').off('click');
    $('#CommercialEditCargoCargo').on('click', function () {
        openCargoTab();
    });
    $('#CommercialEditCargoRate').off('click');
    $('#CommercialEditCargoRate').on('click', function () {
        openRateTab();
    });
    openCargoTab();

    function openCargoTab() {
        $('#CommercialEditCargoCargo').removeClass('btn-secondary');
        $('#CommercialEditCargoCargo').addClass('btn-primary');
        $('#CommercialEditCargoRate').removeClass('btn-primary');
        $('#CommercialEditCargoRate').addClass('btn-secondary');
        $('#EditCommercialCargoBtn').text('Next');
        $('#EditCommercialCargoBtn').off('click');
        $('#EditCommercialCargoBtn').on('click', () => {
            openRateTab();
        });
        let templateHTML = '';
        CargoToEdit.forEach(item => {
            templateHTML += `
                <div id="CommercialEditCargoDiv${item.id}" class="card">
                    <div class="card-header p-0">
                        <h5 class="mb-0">
                            <i id="CommercialEditCargoBadIcon${item.id}" class="fas fa-exclamation-triangle pl-2" style="color:red; display:none;"></i>
                            <button class="btn btn-link btn-sm" type="button" data-toggle="collapse" data-target="#CommercialEditCargoCollapse${item.id}" aria-expanded="false" id="CargoHeaderBtn">${item.cargoDescription}</button>
                        </h5>
                    </div>
                    <div id="CommercialEditCargoCollapse${item.id}" class="collapse" data-parent="#CommercialEditCargoDiv${item.id}">
                        <div class="p-3 card-body">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Cargo Description</span>
                                </div>
                                <input type="text" class="form-control CommercialEditCargoCargoDescription" cargoId="${item.id}" value="${item.cargoDescription}">
                            </div>
                            <div class="text-danger" id="CommercialEditCargoCargoDescriptionError${item.id}"></div>
                            <div class="input-group pt-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Dimensions</span>
                                </div>
                                <div class="d-flex col border-top border-bottom border-right rounded-right">
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input CommercialEditCargoDimType" type="radio" name="CommercialEditCargoDimType${item.id}" id="CommercialEditCargoDimTypeInches${item.id}" value="1" cargoId="${item.id}" ${item.dims.unitOfMeasure == 1 ? 'checked' : ''}>
                                        <label class="form-check-label" for="CommercialEditCargoDimTypeInches${item.id}">Inches</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input CommercialEditCargoDimType" type="radio" name="CommercialEditCargoDimType${item.id}" id="CommercialEditCargoDimTypeFeet${item.id}" value="2" cargoId="${item.id}" ${item.dims.unitOfMeasure == 2 ? 'checked' : ''}>
                                        <label class="form-check-label" for="CommercialEditCargoDimTypeFeet${item.id}">Feet</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input CommercialEditCargoDimType" type="radio" name="CommercialEditCargoDimType${item.id}" id="CommercialEditCargoDimTypeMeters${item.id}" value="3" cargoId="${item.id}" ${item.dims.unitOfMeasure == 3 ? 'checked' : ''}>
                                        <label class="form-check-label" for="CommercialEditCargoDimTypeMeters${item.id}">Meters</label>
                                    </div>
                                </div>
                            </div>
                            <div class="text-danger" id="CommercialEditCargoDimTypeError${item.id}"></div>
                            <div class="pl-5">
                                <div class="input-group pt-2">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text">Length</span>
                                    </div>
                                    <input type="number" class="form-control CommercialEditCargoLength" cargoId="${item.id}" value="${item.dims.length}">
                                </div>
                                <div class="text-danger" id="CommercialEditCargoLengthError${item.id}"></div>
                                <div class="input-group pt-2">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text">Width</span>
                                    </div>
                                    <input type="number" class="form-control CommercialEditCargoWidth" cargoId="${item.id}" value="${item.dims.width}">
                                </div>
                                <div class="text-danger" id="CommercialEditCargoWidthError${item.id}"></div>
                                <div class="input-group pt-2">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text">Height</span>
                                    </div>
                                    <input type="number" class="form-control CommercialEditCargoHeight" cargoId="${item.id}" value="${item.dims.height}">
                                </div>
                                <div class="text-danger" id="CommercialEditCargoHeightError${item.id}"></div>
                            </div>
                            <div class="input-group pt-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">CBM | Inches</span>
                                </div>
                                <input class="form-control CommercialEditCargoCBM bg-white" disabled cargoId="${item.id}" value="${item.dims.volumes.inch}">
                            </div>
                            <div class="input-group pt-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text ">Weight</span>
                                </div>
                                <div class="d-flex col border-top border-bottom border-right rounded-right">
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input CommercialEditCargoWeightType" type="radio" id="CommercialEditWeightTypeLBS${item.id}" name="CommercialEditCargoWeightType${item.id}" value="1" cargoId="${item.id}" ${item.dims.weightUnit == 1 ? 'checked' : ''}>
                                        <label class="form-check-label" for="CommercialEditWeightTypeLBS${item.id}">LBS</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input CommercialEditCargoWeightType" type="radio" id="CommercialEditWeightTypeKG${item.id}" name="CommercialEditCargoWeightType${item.id}" value="2" cargoId="${item.id}" ${item.dims.weightUnit == 2 ? 'checked' : ''}>
                                        <label class="form-check-label" for="CommercialEditWeightTypeKG${item.id}">KG</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input CommercialEditCargoWeightType" type="radio" id="CommercialEditWeightTypeMT${item.id}" name="CommercialEditCargoWeightType${item.id}" value="3" cargoId="${item.id}" ${item.dims.weightUnit == 3 ? 'checked' : ''}>
                                        <label class="form-check-label" for="CommercialEditWeightTypeMT${item.id}">MT</label>
                                    </div>
                                </div>
                            </div>
                            <div class="text-danger" id="CommercialEditWeightTypeError${item.id}"></div>
                            <div class="pl-5">
                                <div class="input-group pt-2">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text">Weight</span>
                                    </div>
                                    <input type="number" class="form-control CommercialEditWeight" cargoId="${item.id}" value="${item.dims.weight}">
                                </div>
                                <div class="text-danger" id="CommercialEditWeightError${item.id}"></div>
                            </div>
                            <div class="input-group pt-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Weight | Kg</span>
                                </div>
                                <input class="form-control CommercialEditCargoKg bg-white" disabled cargoId="${item.id}" value="${item.dims.weights.kg}">
                            </div>
                            <div class="input-group pt-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">AES ITN</span>
                                </div>
                                <input class="form-control CommercialEditCargoAESITN" cargoId="${item.id}" value="${item.AESITN ? item.AESITN : ''}">
                            </div>
                            <div class="input-group pt-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">HS Code</span>
                                </div>
                                <input class="form-control CommercialEditCargoHSCode" cargoId="${item.id}" value="${item.HSCode ? item.HSCode : ''}">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $('#CommercialEditCargoCargoTemplate').html(templateHTML);
        });
        $('#CommercialEditCargoBody').html($('#CommercialEditCargoCargoTemplate').html());
        loadCargoTab();

        //Cargo Tab On Changes
        //Cargo Description
        $('.CommercialEditCargoCargoDescription').off('change');
        $('.CommercialEditCargoCargoDescription').on('change', function() {
            const cargoIndex = getCargoState($(this).attr('cargoId'));
            CargoToEdit[cargoIndex].cargoDescription = $(this).val();
        });
        //Cargo Dim Type
        $('.CommercialEditCargoDimType').off('click');
        $('.CommercialEditCargoDimType').on('click', function() {
            const cargoIndex = getCargoState($(this).attr('cargoId'));
            CargoToEdit[cargoIndex].dims.unitOfMeasure = $(this).val();
            updateCargoNoTransaction([new CommercialCargo3(CargoToEdit[cargoIndex])]);
        });
        //Cargo Length
        $('.CommercialEditCargoLength').off('change');
        $('.CommercialEditCargoLength').on('change', function() {
            const cargoIndex = getCargoState($(this).attr('cargoId'));
            CargoToEdit[cargoIndex].dims.length = $(this).val();
            updateCargoNoTransaction([new CommercialCargo3(CargoToEdit[cargoIndex])]);
        });
        //Cargo Width
        $('.CommercialEditCargoWidth').off('change');
        $('.CommercialEditCargoWidth').on('change', function() {
            const cargoIndex = getCargoState($(this).attr('cargoId'));
            CargoToEdit[cargoIndex].dims.width = $(this).val();
            updateCargoNoTransaction([new CommercialCargo3(CargoToEdit[cargoIndex])]);
        });
        //Cargo Height
        $('.CommercialEditCargoHeight').off('change');
        $('.CommercialEditCargoHeight').on('change', function() {
            const cargoIndex = getCargoState($(this).attr('cargoId'));
            CargoToEdit[cargoIndex].dims.height = $(this).val();
            updateCargoNoTransaction([new CommercialCargo3(CargoToEdit[cargoIndex])]);
        });
        //Cargo Weight Type
        $('.CommercialEditCargoWeightType').off('change');
        $('.CommercialEditCargoWeightType').on('change', function() {
            const cargoIndex = getCargoState($(this).attr('cargoId'));
            CargoToEdit[cargoIndex].dims.weightUnit = $(this).val();
            updateCargoNoTransaction([new CommercialCargo3(CargoToEdit[cargoIndex])]);
        });
        //Cargo Weight
        $('.CommercialEditWeight').off('change');
        $('.CommercialEditWeight').on('change', function() {
            const cargoIndex = getCargoState($(this).attr('cargoId'));
            CargoToEdit[cargoIndex].dims.weight = $(this).val();
            updateCargoNoTransaction([new CommercialCargo3(CargoToEdit[cargoIndex])]);
        });
        //AES ITN
        $('.CommercialEditCargoAESITN').off('change');
        $('.CommercialEditCargoAESITN').on('change', function() {
            const cargoIndex = getCargoState($(this).attr('cargoId'));
            CargoToEdit[cargoIndex].AESITN = $(this).val();
        });
        //HSCode
        $('.CommercialEditCargoHSCode').off('change');
        $('.CommercialEditCargoHSCode').on('change', function() {
            const cargoIndex = getCargoState($(this).attr('cargoId'));
            CargoToEdit[cargoIndex].HSCode = $(this).val();
        });


        //Helper Function
        //Loads the cargo tab with values
        function loadCargoTab() {
            CargoToEdit.forEach(item => {
                $(`.CommercialEditCargoCargoDescription[cargoId='${item.id}']`).val(item.cargoDescription);
                $(`.CommercialEditCargoDimType[cargoId='${item.id}'][value='${item.dims.unitOfMeasure}']`).prop('checked', true);
                $(`.CommercialEditCargoLength[cargoId='${item.id}']`).val(item.dims.length);
                $(`.CommercialEditCargoWidth[cargoId='${item.id}']`).val(item.dims.width);
                $(`.CommercialEditCargoHeight[cargoId='${item.id}']`).val(item.dims.height);
                $(`.CommercialEditCargoCBM[cargoId='${item.id}']`).val(item.dims.volumes.inch);
                $(`.CommercialEditCargoWeightType[cargoId='${item.id}'][value='${item.dims.weightUnit}']`).prop('checked', true);
                $(`.CommercialEditCargoWeight[cargoId='${item.id}']`).val(item.dims.weight);
                $(`.CommercialEditCargoKg[cargoId='${item.id}']`).val(item.dims.weights.kg);
                $(`.CommercialEditCargoAESITN[cargoId='${item.id}']`).val(item.AESITN);
                $(`.CommercialEditCargoHSCode[cargoId='${item.id}']`).val(item.HSCode);
            })
        }
        //Helper Function
        //Calls the updateCargo Lambda and replaces the cargo in CargoToEdit
        function updateCargoNoTransaction(cargo) {
            $.ajax({
                url: api.updateCargoNoTransaction.url,
                dataType: 'json',
                type: 'post',
                contentType: 'application/json',
                data: JSON.stringify(cargo),
                headers: api.updateCargoNoTransaction.key,
                processData: false,
                success: function( data, textStatus, xhr ){
                    const cargoIndex = getCargoState(data[0].id);
                    CargoToEdit[cargoIndex] = new CommercialCargo3((data[0]));
                    console.log(CargoToEdit);
                },
                error: function(xhr, textStatus, errorThrown ){
                    console.log( {errorThrown} );
                },
                complete: function(){
                    loadCargoTab();
                }
            });
        }
    }
    function openRateTab() {
        $('#EditCommercialCargoBtn').text('Submit');
        $('#CommercialEditCargoCargo').removeClass('btn-primary');
        $('#CommercialEditCargoCargo').addClass('btn-secondary');
        $('#CommercialEditCargoRate').removeClass('btn-secondary');
        $('#CommercialEditCargoRate').addClass('btn-primary');

        let templateHTML = '';
        CargoToEdit.forEach(cargo => {
            let ratesBody = '';
            cargo.rates.forEach((rate, rateIndex) => {
                let tmpFeeTypes = rateFeeTypes.filter(item => {
                    return item.RateTypeId == rate.rateType;
                });
                ratesBody += `
                <div class="input-group pt-3 CommercialEditCargoRateDiv" cargoId="${cargo.id}" rateIndex="${rateIndex}">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${tmpFeeTypes.length > 0 ? tmpFeeTypes[0].RateType : ''}</span>
                    </div>
                    <input value="${rate.cost}" size="17" cargoId="${cargo.id}" rateIndex="${rateIndex}">
                    <select class="CommercialEditCargoRateFeeType" cargoId="${cargo.id}" rateIndex="${rateIndex}">
                        ${rateFeeTypeOptions(tmpFeeTypes)}
                    </select>
                    <button class="input-group-append btn btn-outline-danger CommercialEditCargoRemoveRateBtn" cargoId="${cargo.id}" rateIndex="${rateIndex}">X</button>
                </div>
                <div class="pb-2 text-danger CommercialEditCargoRateError" style="display: none" cargoId="${cargo.id}" rateIndex="${rateIndex}"></div>
                `
            });
            templateHTML += `
            <div id="CommercialEditCargoRatesDiv${cargo.id}" class="card" cargoId="${cargo.id}">
                <div class="card-header p-0">
                    <h5 class="mb-0">
                        <i class="CommercialEditCargoRatesBadIcon fas fa-exclamation-triangle pl-2" style="color:red; display:none;" cargoId="${cargo.id}"></i>
                        <button class="btn btn-link btn-sm" type="button" data-toggle="collapse" data-target="#CommercialEditCargoRatesCollapse${cargo.id}">${cargo.cargoDescription}</button>
                    </h5>
                </div>
                <div id="CommercialEditCargoRatesCollapse${cargo.id}" class="collapse" data-parent="#CommercialEditCargoRatesDiv${cargo.id}">
                    <div class="p-3 card-body">
                        <button class="btn btn-outline-primary CommercialEditCargoAddRateBtn" cargoId="${cargo.id}">+Add Rate</button>
                        ${ratesBody}
                    </div>
                </div>
            </div>
            `;
        });
        $('#CommercialEditCargoBody').html(templateHTML);
        $('.CommercialEditCargoAddRateBtn').off('click');
        $('.CommercialEditCargoAddRateBtn').on('click', function() {
            const cargo = CargoToEdit.filter(item => {
                return item.id == $(this).attr('cargoId');
            })[0];
            const currentRates = [];
            cargo.rates.forEach(item => {
                currentRates.push(new Rates(item));
            });
            const availableRates = rateFeeTypes.filter(item => {
                let isGoodRate = true;
                currentRates.forEach(rate => {
                    if(item.RateTypeId == rate.rateType) {
                        isGoodRate = false;
                    }
                });
                if(isGoodRate) {
                    return item;
                }
            });
            const tmpOptions = [];
            let tmpOptionsHtml = '';
            availableRates.forEach(item => {
                let tmpIndex = tmpOptions.findIndex(tmpOption => {
                    return item.RateTypeId == tmpOption.RateTypeId;
                });
                if(tmpIndex == -1) {
                    tmpOptions.push(item);
                    tmpOptionsHtml += `<option value="${item.RateTypeId}">${item.RateType}</option>`;
                };
            });
            let parentDiv = $(this).parent();
            parentDiv.append(`
                <div class="input-group pt-3 CommercialEditCargoRateDiv" cargoId="${cargo.id}" rateIndex="${cargo.rates.length}">
                    <div class="input-group-prepend col p-0">
                        <select class="CommercialEditCargoAddRateSelect custom-select" cargoId="${cargo.id}" rateIndex="${cargo.rates.length}">  
                            ${tmpOptionsHtml}
                        </select>
                    </div>
                    <input type="number" class="CommercialEditCargoAddRateRate" cargoId="${cargo.id}" rateIndex="${cargo.rates.length}">
                    <div class="input-group-append col p-0">
                        <select class="CommercialEditCargoAddRateFeeType custom-select" cargoId="${cargo.id}" rateIndex="${cargo.rates.length}">
                        </select>
                    </div>
                    <button class="input-group-append btn btn-outline-danger CommercialEditCargoRemoveRateBtn" cargoId="${cargo.id}" rateIndex="${cargo.rates.length}">X</button>
                    <div class="pb-2 text-danger CommercialEditCargoRateError" style="display: none" cargoId="${cargo.id}" rateIndex="${cargo.rates.length}"></div>
                </div>
            `);
            cargo.rates.push(new Rates());
            $('.CommercialEditCargoAddRateSelect').off('change');
            $('.CommercialEditCargoAddRateSelect').on('change', function() {
                const cargoId = $(this).attr('cargoId');
                const rateIndex = $(this).attr('rateIndex');
                const selectedRate = $(this).val();
                const availableFeeTypes = rateFeeTypes.filter(item => {
                    return item.RateTypeId == selectedRate;
                });
                $(`.CommercialEditCargoAddRateFeeType[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).html('');
                availableFeeTypes.forEach(item => {
                    $(`.CommercialEditCargoAddRateFeeType[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).append(`<option value="${item.FeeTypeId}">${item.FeeType}</option>`);
                });
                const cargoIndex = CargoToEdit.findIndex(item => {
                    return item.id == cargoId;
                });
                CargoToEdit[cargoIndex].rates[rateIndex].rateType = selectedRate;
            });
            $('.CommercialEditCargoAddRateSelect').change();
            $('.CommercialEditCargoAddRateRate').off('change');
            $('.CommercialEditCargoAddRateRate').on('change', function () {
                const cargoId = $(this).attr('cargoId');
                const rateIndex = $(this).attr('rateIndex');
                const rate = $(this).val();
                const cargoIndex = CargoToEdit.findIndex(item => {
                    return item.id == cargoId;
                });
                CargoToEdit[cargoIndex].rates[rateIndex].rate = rate;
            });
            $('.CommercialEditCargoAddRateFeeType').off('change');
            $('.CommercialEditCargoAddRateFeeType').on('change', function() {
                const cargoId = $(this).attr('cargoId');
                const rateIndex = $(this).attr('rateIndex');
                const feeType = $(this).val();
                const cargoIndex = CargoToEdit.findIndex(item => {
                    return item.id == cargoId;
                });
                CargoToEdit[cargoIndex].rates[rateIndex].unitType = feeType;
            });
            $('.CommercialEditCargoAddRateFeeType').change();
            $('.CommercialEditCargoRemoveRateBtn').off('change');
            $('.CommercialEditCargoRemoveRateBtn').on('change', function() {
                const cargoId = $(this).attr('cargoId');
                const rateIndex = $(this).attr('rateIndex');
                const cargoIndex = CargoToEdit.findIndex(item => {
                    return item.id == cargoId;
                });
                if(CargoToEdit[cargoIndex].rates.length == 1) {
                    $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).text('You must have atleast one rate!');
                    $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).show();
                    $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).delay(3000).fadeOut(1000);
                } else if(CargoToEdit[cargoIndex].rates[rateIndex].rateType == 1) {
                    $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).text('You can not remove the Ocean Rate!');
                    $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).show();
                    $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).delay(3000).fadeOut(1000);
                } else {
                    CargoToEdit[cargoIndex].rates.splice(rateIndex, 1);
                    $(`.CommercialEditCargoRateDiv[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).remove();
                    const CommercialEditDivs = $(`.CommercialEditCargoRateDiv`);
                    console.log(CommercialEditDivs);
                }
            });
        });
        $('.CommercialEditCargoRemoveRateBtn').off('click');
        $('.CommercialEditCargoRemoveRateBtn').on('click', function() {
            const cargoId = $(this).attr('cargoId');
            const rateIndex = $(this).attr('rateIndex');
            const cargoIndex = CargoToEdit.findIndex(item => {
                return item.id == cargoId;
            });
            if(CargoToEdit[cargoIndex].rates.length == 1) {
                $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).text('You must have atleast one rate!');
                $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).show();
                $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).delay(3000).fadeOut(1000);
            } else if(CargoToEdit[cargoIndex].rates[rateIndex].rateType == 1) {
                $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).text('You can not remove the Ocean Rate!');
                $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).show();
                $(`.CommercialEditCargoRateError[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).delay(3000).fadeOut(1000);
            } else {
                console.log('here');
                CargoToEdit[cargoIndex].rates.splice(rateIndex, 1);
                $(`.CommercialEditCargoRateDiv[cargoId='${cargoId}'][rateIndex='${rateIndex}']`).remove();
                const CommercialEditDivs = $(`.CommercialEditCargoRateDiv`);
                console.log(CommercialEditDivs);
            }
        });
        $('#EditCommercialCargoBtn').off('click');
        $('#EditCommercialCargoBtn').on('click', function() {
            console.log(CargoToEdit);
        });
        function rateFeeTypeOptions(arr) {
            if(arr.lengh < 1) {
                return `<h5>There are no rates for this cargo!</h5>`;
            } 
            let options = '';
            arr.forEach(item => {
                options += `<option value="${item.FeeTypeId}">${item.FeeType}</option>`;
            });
            return options;
        }
    }
    function saveRateTab() {

    }
    //Helper Function 
    function getCargoState(cargoId) {
        return CargoToEdit.findIndex(item => {
            return item.id == cargoId;
        });
    }
}

function loadCommercialCargoTable() {
    CommercialTable = $('#CommercialCargoTable').DataTable({
        destroy: true,
        paging: false,
        data: commercialCargo,
        select: {
            style: 'multi',
            items: 'row'
        },
        buttons: [
            //Create Masters
            {
                text: 'Create Masters',
                action: function ( e, dt, node, config ) {
                    openCommercialMastersModal();
                },
                className: "btn btn-outline-success mb-2 selectedRowBtn CommercialTableBtn"
            },
            //Select All
            {
                text: 'Select All',
                action: function ( e, dt, node, config ) {
                    dt.rows().select();
                },
                className: "btn btn-outline-primary mb-2 selectedRowBtn CommercialTableBtn"
            },
            //Deselect All
            {
                text: 'Deselect All',
                action: function ( e, dt, node, config ) {
                    dt.rows().deselect();
                },
                className: "btn btn-outline-primary mb-2 selectedRowBtn CommercialTableBtn"
            },
            //Edit
            {
                text: 'Edit Cargo',
                action: function ( e, dt, node, config ) {
                    openEditCommercialCargoModal();
                },
                className: "btn btn-outline-success mb-2 selectedRowBtn CommercialTableBtn"
            },
        ],
        columns: [
            //Cargo ID(Invisible)
            {
                data: 'id',
                visible: false,
            },
            //VIN
            {
                data: 'VIN',
                name: 'VIN',
                render: function(data) {
                    return data ? data : 'N/A';
                }
            },
            //Forwarder
            {
                data: 'forwarder',
                name: 'forwarder',
                render: function(data) {
                    return data ? data.name : 'N/A';
                }
            },
            //POL
            {
                data: 'POL',
                name: 'POL',
                render: function(data) {
                    return data.port.Name;
                }
            },
            //POD
            {
                data: 'POD',
                name: 'POD',
                render: function(data) {
                    return data.port.Name;
                }
            },
            //BookingNumber
            {
                data: 'bookingNumber',
                name: 'bookingNumber',
                render: function(data) {
                    return data ? data : 'N/A';
                }
            }
        ],
        "order": [[ 0, "desc" ]],
        "dom": 'BSt<"row"<"col m-auto"l><"col m-auto text-center"i><"col"p>>'
    });
    updateTable();

    function updateTable() {
        $('#CommercialCargoBadge').html(commercialCargo.length);
        $('.CommercialTableBtn').removeClass('dt-button');
    }
}

function loadCommercialMastersTable() {
    MastersTable = $('#CommercialMastersTable').DataTable({
        destroy: true,
        paging: false,
        data: masters,
        select: {
            style: 'multi',
            items: 'row'
        },
        buttons: [
            //Select All
            {
                text: 'Select All',
                action: function ( e, dt, node, config ) {
                    dt.rows().select();
                },
                className: "btn btn-outline-primary mb-2 selectedRowBtn CommercialMastersTableBtn"
            },
            //Deselect All
            {
                text: 'Deselect All',
                action: function ( e, dt, node, config ) {
                    dt.rows().deselect();
                },
                className: "btn btn-outline-primary mb-2 selectedRowBtn CommercialMastersTableBtn"
            },
            //Approve Bills
            {
                text: 'Create Bills',
                action: function ( e, dt, node, config ) {
                    openMassCreateBillsModal();
                },
                className: "btn btn-outline-primary mb-2 selectedRowBtn CommercialMastersTableBtn"
            },
            //Mass Void
            {
                text: 'Mass Void',
                action: function ( e, dt, node, config ) {
                    openMassVoidMastersModal();
                },
                className: "btn btn-outline-success mb-2 selectedRowBtn CommercialMastersTableBtn"
            },
        ],
        columns: [
            //Details
            {
                orderable: false,
                data: 'id',
                render: function(data) {
                    return `<button class='btn btn-sm details CommercialMastersDetail' BOLId="${data}"><i class='far fa-minus-square'></i></button>`;
                }
            },
            //Bill Id
            {
                data: 'id',
                render: function(data) {
                    return data;
                }
            },
            //Forwarder
            {
                data: 'forwarder',
                name: 'forwarder',
                render: function(data) {
                    return data ? data.name : 'N/A';
                }
            },
            //Vessel
            {
                "data": function(row, type, val, meta) {
                    return row;
                },
                name: 'vessel',
                render: function(data) {
                    return data ? `${data.vessel.Name} v.${data.voyageNum}` : 'N/A'
                }
            },
            //POL
            {
                data: 'POL',
                name: 'POL',
                render: function(data) {
                    return data.Name;
                }
            },
            //POD
            {
                data: 'POD',
                name: 'POD',
                render: function(data) {
                    return data.Name;
                }
            },
            //Total Units
            {
                data: 'cargo',
                name: 'cargo',
                render: function(data) {
                    return data.length;
                }
            },
            //Actions
            {
                data: function(row, type, val, meta) {
                    return row;
                },
                name: 'actions',
                render: function(data) {
                    return `
                    <button class="btn btn-sm" onclick="javascript:openCreateBillsModal('${data.id}')" ${data.isVoid ? 'disabled' : ''}>
                        <i class="fas fa-check-square" title="Create"></i>
                    </button>
                    <button class="btn btn-sm" onclick="javascript:openEditMastersModal('${data.id}')" ${data.isVoid ? 'disabled' : ''}>
                        <i class="fas fa-edit" title="Edit"></i>
                    </button>
                    <button class="btn btn-sm" onclick="javascript:openBOLHistory('${data.id}')" ${data.isVoid ? 'disabled' : ''}>
                        <i class="fas fa-history" title="History"></i>
                    </button>
                    <button class="btn btn-sm" onclick="javascript:openVoidMastersModal('${data.id}')" ${data.isVoid ? 'disabled' : ''}>
                        <i class="fas fa-ban" title="Void"></i>
                    </button>
                    `;
                }
            },
        ],
        "order": [[ 1, "desc" ]],
        "dom": 'BSt<"row"<"col m-auto"l><"col m-auto text-center"i><"col"p>>',
        "rowCallback": function (row, data) {
            if ( data.isVoid ) {
                $(row).addClass('voidedBooking');
            }
        }
    });
    updateTable();

    function updateTable() {
        $('#CommercialMastersBadge').html(masters.length);
        $('.CommercialMastersTableBtn').removeClass('dt-button');

        $('.CommercialMastersDetail').off('click');
        $('.CommercialMastersDetail').on('click', function() {
            let tr = $(this).parent().parent();
            if(tr.hasClass('Shown')) {
                tr.removeClass('Shown');
                tr.next().remove();
            } else {
                tr.addClass('Shown');
                tr.after(`<tr><td class="p-4" colspan="8">${getMastersDetails($(this).attr('BOLId'))}</td></tr>`);
                $('.CommercialMastersDetailsDetailsBtn').off('click');
                $('.CommercialMastersDetailsDetailsBtn').on('click', function() {
                    let div = $(this).parent();
                    if(!div.hasClass('shown')) {
                        div.addClass('shown');
                        div.next().show();
                    } else {
                        div.removeClass('shown');
                        div.next().hide();
                    }
                })
            }
        });
    }

    function getMastersDetails(BOLId) {
        const BOLObject = masters.filter(item => {
            return item.id == BOLId;
        })[0];
        console.log(BOLObject);
    
        return `
        <strong>Status:</strong> <span>${readReferenceTables(BOLStatuses, BOLObject.status).description}</span><br>
        <strong>Freight Terms:</strong> <span>${readReferenceTables(freightTerms, BOLObject.freightTerms).freightTerm}</span><br>
        <strong>Carrier Booking Ref:</strong> <span>${BOLObject.carrierBookingRef}</span><br>
        <strong>Export Ref:</strong> <span>${BOLObject.exportReference}</span><br>
        <div class="pt-1">
            <strong>Forwarder:</strong> <button class="btn btn-sm btn-outline-primary pt-0 pb-0 ml-2 CommercialMastersDetailsDetailsBtn">Details</button><br>
        </div>
        <div class="pl-4" style="display: none">${entityDetails(BOLObject.forwarder)}</div>
        <div class="pt-1">
            <strong>Shipper:</strong> <button class="btn btn-sm btn-outline-primary pt-0 pb-0 ml-2 CommercialMastersDetailsDetailsBtn">Details</button><br>
        </div>
        <div class="pl-4" style="display: none">${entityDetails(BOLObject.shipper)}</div>
        <div class="pt-1">
            <strong>Consignee:</strong> <button class="btn btn-sm btn-outline-primary pt-0 pb-0 ml-2 CommercialMastersDetailsDetailsBtn">Details</button><br>
        </div>
        <div class="pl-4" style="display: none">${entityDetails(BOLObject.consignee)}</div>
        <div class="pt-1">
            <strong>Notify Party:</strong> <button class="btn btn-sm btn-outline-primary pt-0 pb-0 ml-2 CommercialMastersDetailsDetailsBtn">Details</button><br>
        </div>
        <div class="pl-4" style="display: none">${entityDetails(BOLObject.notifyParty)}</div>
        <strong>Captain:</strong> <span>${BOLObject.captain}</span><br>
        <strong>Declaration Of Value: </strong> <span>${BOLObject.declarationOfValue}</span><br>
        <strong>NRT:</strong> <span>${BOLObject.NRT}</span><br>
        <strong>GRT:</strong> <span>${BOLObject.GRT}</span><br>
        <strong>Cargo:</strong><br>
        ${cargoDetails(BOLObject.cargo)}
        <strong>Rates:</strong><br>
        ${rateDetails(BOLObject.cargoRates.concat(BOLObject.BOLRates))}
        `;

        function entityDetails(entity) {
            return `
            <strong>${entity.name}</strong><br>
            <span>Address: </strong>${entity.address.address1} ${entity.address.address2 ? entity.address.address2 : ''} ${entity.address.city}, ${entity.address.state}, ${entity.address.zip}<br>
            <span>Contacts: </span><br>
            <span>Name: </span>${entity.contact.name ? entity.contact.name : ''}<br>
            <span>Email: </span>${entity.contact.email ? entity.contact.email : ''}<br>
            <span>Phone: </span>${entity.contact.phone ? entity.contact.phone : ''}<br>
            <span>Fax: </span>${entity.contact.fax ? entity.contact.fax : ''}<br>
            `;
        }
        function cargoDetails(cargo) {
            let rowsOfCargo = ``;
            cargo.forEach(item => {
                rowsOfCargo += `
                <tr>
                    <td>${item.VIN}</td>
                    <td>${item.cargoDescription}</td>
                    <td>${readReferenceTables(cargoSubTypes, item.cargoSubType).ShortDesc}</td>
                    <td>${parseFloat(item.dims.length).toFixed(BOLObject.roundCBM)}</td>
                    <td>${parseFloat(item.dims.width).toFixed(BOLObject.roundCBM)}</td>
                    <td>${parseFloat(item.dims.height).toFixed(BOLObject.roundCBM)}</td>
                    <td>${parseFloat(item.dims.volumes.m).toFixed(BOLObject.roundCBM)}</td>
                    <td>${parseFloat(item.dims.weight).toFixed(BOLObject.roundWeight)}</td>
                    <td>${item.AESITN}</td>
                    <td>${item.HSCode}</td>
                </tr>
                `
            });
            return `
            <table class="table table-sm table-hover" style="width:100%">
                <thead>
                    <td><strong>VIN</strong></td>
                    <td><strong>Cargo Description</strong></td>
                    <td><strong>Cargo SubType</strong></td>
                    <td><strong>Length</strong></td>
                    <td><strong>Width</strong></td>
                    <td><strong>Height</strong></td>
                    <td><strong>Volume</strong></td>
                    <td><strong>Weight</strong></td>
                    <td><strong>AES ITN</strong></td>
                    <td><strong>HS Code</strong></td>
                </thead>
                <tbody>
                    ${rowsOfCargo}
                </tbody>
            </table>
            `
        }
        function rateDetails(rates) {
            let rowsOfRate = ``;
            rates.forEach(item => {
                let service = rateFeeTypes.filter(rateFeeType => {
                    return rateFeeType.RateTypeId == item.rateType;
                })[0].RateType;
                let rateType = rateFeeTypes.filter(rateFeeType => {
                    return rateFeeType.FeeTypeId == item.unitType;
                })[0].FeeType;
                rowsOfRate += `
                <tr>
                    <td>${service}</td>
                    <td>${rateType}</td>
                    <td>${item.rate}</td>
                    <td>${item.unitTypeAmount}</td>
                    <td>${item.cost}</td>
                </tr>
                `
            })
            return `
            <table class="table table-sm table-hover" style="width:100%">
                <thead>
                    <td><strong>Service</strong></td>
                    <td><strong>Rate Type</strong></td>
                    <td><strong>Rate</strong></td>
                    <td><strong>Quantity</strong></td>
                    <td><strong>Cost</strong></td>
                </thead>
                <tbody>
                    ${rowsOfRate}
                </tbody>
            </table>
            `
        }
    }
}

function loadCommercialBOLTable() {
    BillsOfLadingTable = $('#CommercialBOLTable').DataTable({
        destroy: true,
        paging: false,
        data: billsOflading,
        select: {
            style: 'multi',
            items: 'row'
        },
        buttons: [
            //Select All
            {
                text: 'Select All',
                action: function ( e, dt, node, config ) {
                    dt.rows().select();
                },
                className: "btn btn-outline-primary mb-2 selectedRowBtn CommercialBOLTableBtn"
            },
            //Deselect All
            {
                text: 'Deselect All',
                action: function ( e, dt, node, config ) {
                    dt.rows().deselect();
                },
                className: "btn btn-outline-primary mb-2 selectedRowBtn CommercialBOLTableBtn"
            },
            //Approve Bills
            {
                text: 'Approve Bills',
                action: function ( e, dt, node, config ) {
                    openMassApproveModal();
                },
                className: "btn btn-outline-primary mb-2 selectedRowBtn CommercialBOLTableBtn"
            },
            //Download Reports
            {
                text: 'Download',
                action: function ( e, dt, node, config ) {
                    downloadMultipleReportsBOL(dt.rows({ search: 'applied' }).data());
                },
                className: "btn btn-outline-success mb-2 selectedRowBtn CommercialBOLTableBtn"
            },
            //Edit
            {
                text: 'Mass Edit',
                action: function ( e, dt, node, config ) {
                    openMassEditMastersModal();
                },
                className: "btn btn-outline-success mb-2 selectedRowBtn CommercialBOLTableBtn"
            },
        ],
        columns: [
            //Details
            {
                orderable: false,
                data: 'id',
                render: function(data) {
                    return `<button class='btn btn-sm details CommercialBOLDetail' BOLId="${data}"><i class='far fa-minus-square'></i></button>`;
                }
            },
            //Bill #
            {
                data: 'BOLNumber',
                name: 'BOLNumber',
                render: function(data) {
                    return data;
                }
            },
            //BOL Status
            {
                data: 'status',
                name: 'status',
                render: function(data) {
                    let tmp = BOLStatuses.filter(item => {
                        return item.id == data;
                    });
                    return tmp[0] ? tmp[0].description : 'N/A';
                }
            },
            //Forwarder
            {
                data: 'forwarder',
                name: 'forwarder',
                render: function(data) {
                    return data.name ? data.name : 'N/A'
                }
            },
            //POL
            {
                data: 'POL',
                name: 'POL',
                render: function(data) {
                    return data.Name;
                }
            },
            //POD
            {
                data: 'POD',
                name: 'POD',
                render: function(data) {
                    return data.Name;
                }
            },
            //Total Units
            {
                data: 'cargo',
                name: 'cargo',
                render: function(data) {
                    return data.length;
                }
            },
            //Actions
            {
                data: function(row, type, val, meta) {
                    return row;
                },
                name: 'actions',
                render: function(data) {
                    return `
                    <button class="btn btn-sm" onclick="javascript:openApproveMastersModal('${data.id}')" ${data.isVoid ? 'disabled' : ''}>
                        <i class="fas fa-check-square" title="Approve"></i>
                    </button>
                    <button class="btn btn-sm" onclick="javascript:openEditBOLModal('${data.id}')" ${data.isVoid ? 'disabled' : ''}>
                        <i class="fas fa-edit" title="Edit"></i>
                    </button>
                    <button class="btn btn-sm" onclick="javascript:openSplitMastersModal('${data.id}')" ${data.isVoid ? 'disabled' : ''}>
                        <i class="fas fa-arrows-alt-h" title="Split"></i>
                    </button>
                    <button class="btn btn-sm" onclick="javascript:openBOLHistory('${data.id}')" ${data.isVoid ? 'disabled' : ''}>
                        <i class="fas fa-history" title="History"></i>
                    </button>
                    <button class="btn btn-sm" onclick="javascript:downloadReportBOL('${data.id}')" ${data.isVoid ? 'disabled' : ''}>
                        <i class="fas fa-download" title="Download"></i>
                    </button>
                    <button class="btn btn-sm" onclick="javascript:downloadBOL('${data.id}')" ${data.isVoid ? 'disabled' : ''}>
                        <i class="fas fa-file-powerpoint" title="Donwload PDF"></i>
                    </button>
                    <button class="btn btn-sm" onclick="javascript:openVoidBOLModal('${data.id}')" ${data.isVoid ? 'disabled' : ''}>
                        <i class="fas fa-ban" title="Void"></i>
                    </button>
                    `;
                }
            },
        ],
        "order": [[ 1, "desc" ]],
        "dom": 'BSt<"row"<"col m-auto"l><"col m-auto text-center"i><"col"p>>',
        "rowCallback": function (row, data) {
            if ( data.isVoid ) {
                $(row).addClass('voidedBooking');
            }
        }
    });
    updateTable();

    function updateTable() {
        $('#CommercialBOLBadge').html(billsOflading.length);
        $('.CommercialBOLTableBtn').removeClass('dt-button');

        $('.CommercialBOLDetail').off('click');
        $('.CommercialBOLDetail').on('click', function() {
            let tr = $(this).parent().parent();
            if(tr.hasClass('Shown')) {
                tr.removeClass('Shown');
                tr.next().remove();
            } else {
                tr.addClass('Shown');
                tr.after(`<tr><td class="p-4" colspan="8">${getBOLDetails($(this).attr('BOLId'))}</td></tr>`);
                $('.CommercialBOLDetailsDetailsBtn').off('click');
                $('.CommercialBOLDetailsDetailsBtn').on('click', function() {
                    let div = $(this).parent();
                    if(!div.hasClass('shown')) {
                        div.addClass('shown');
                        div.next().show();
                    } else {
                        div.removeClass('shown');
                        div.next().hide();
                    }
                })
            }
        });
    }

    function getBOLDetails(BOLId) {
        const BOLObject = billsOflading.filter(item => {
            return item.id == BOLId;
        })[0];
        console.log(BOLObject);
    
        return `
        <strong>Status:</strong> <span>${readReferenceTables(BOLStatuses, BOLObject.status).description}</span><br>
        <strong>Freight Terms:</strong> <span>${readReferenceTables(freightTerms, BOLObject.freightTerms).freightTerm}</span><br>
        <strong>Carrier Booking Ref:</strong> <span>${BOLObject.carrierBookingRef}</span><br>
        <strong>Export Ref:</strong> <span>${BOLObject.exportReference}</span><br>
        <div class="pt-1">
            <strong>Forwarder:</strong> <button class="btn btn-sm btn-outline-primary pt-0 pb-0 ml-2 CommercialBOLDetailsDetailsBtn">Details</button><br>
        </div>
        <div class="pl-4" style="display: none">${entityDetails(BOLObject.forwarder)}</div>
        <div class="pt-1">
            <strong>Shipper:</strong> <button class="btn btn-sm btn-outline-primary pt-0 pb-0 ml-2 CommercialBOLDetailsDetailsBtn">Details</button><br>
        </div>
        <div class="pl-4" style="display: none">${entityDetails(BOLObject.shipper)}</div>
        <div class="pt-1">
            <strong>Consignee:</strong> <button class="btn btn-sm btn-outline-primary pt-0 pb-0 ml-2 CommercialBOLDetailsDetailsBtn">Details</button><br>
        </div>
        <div class="pl-4" style="display: none">${entityDetails(BOLObject.consignee)}</div>
        <div class="pt-1">
            <strong>Notify Party:</strong> <button class="btn btn-sm btn-outline-primary pt-0 pb-0 ml-2 CommercialBOLDetailsDetailsBtn">Details</button><br>
        </div>
        <div class="pl-4" style="display: none">${entityDetails(BOLObject.notifyParty)}</div>
        <strong>Captain:</strong> <span>${BOLObject.captain}</span><br>
        <strong>Declaration Of Value: </strong> <span>${BOLObject.declarationOfValue}</span><br>
        <strong>NRT:</strong> <span>${BOLObject.NRT}</span><br>
        <strong>GRT:</strong> <span>${BOLObject.GRT}</span><br>
        <strong>Cargo:</strong><br>
        ${cargoDetails(BOLObject.cargo)}
        <strong>Rates:</strong><br>
        ${rateDetails(BOLObject.cargoRates.concat(BOLObject.BOLRates))}
        `;

        function entityDetails(entity) {
            return `
            <strong>${entity.name}</strong><br>
            <span>Address: </strong>${entity.address.address1} ${entity.address.address2 ? entity.address.address2 : ''} ${entity.address.city}, ${entity.address.state}, ${entity.address.zip}<br>
            <span>Contacts: </span><br>
            <span>Name: </span>${entity.contact.name ? entity.contact.name : ''}<br>
            <span>Email: </span>${entity.contact.email ? entity.contact.email : ''}<br>
            <span>Phone: </span>${entity.contact.phone ? entity.contact.phone : ''}<br>
            <span>Fax: </span>${entity.contact.fax ? entity.contact.fax : ''}<br>
            `;
        }
        function cargoDetails(cargo) {
            let rowsOfCargo = ``;
            cargo.forEach(item => {
                rowsOfCargo += `
                <tr>
                    <td>${item.VIN}</td>
                    <td>${item.cargoDescription}</td>
                    <td>${readReferenceTables(cargoSubTypes, item.cargoSubType).ShortDesc}</td>
                    <td>${parseFloat(item.dims.length).toFixed(BOLObject.roundCBM)}</td>
                    <td>${parseFloat(item.dims.width).toFixed(BOLObject.roundCBM)}</td>
                    <td>${parseFloat(item.dims.height).toFixed(BOLObject.roundCBM)}</td>
                    <td>${parseFloat(item.dims.volumes.m).toFixed(BOLObject.roundCBM)}</td>
                    <td>${parseFloat(item.dims.weight).toFixed(BOLObject.roundWeight)}</td>
                    <td>${item.AESITN}</td>
                    <td>${item.HSCode}</td>
                </tr>
                `
            });
            return `
            <table class="table table-sm table-hover" style="width:100%">
                <thead>
                    <td><strong>VIN</strong></td>
                    <td><strong>Cargo Description</strong></td>
                    <td><strong>Cargo SubType</strong></td>
                    <td><strong>Length</strong></td>
                    <td><strong>Width</strong></td>
                    <td><strong>Height</strong></td>
                    <td><strong>Volume</strong></td>
                    <td><strong>Weight</strong></td>
                    <td><strong>AES ITN</strong></td>
                    <td><strong>HS Code</strong></td>
                </thead>
                <tbody>
                    ${rowsOfCargo}
                </tbody>
            </table>
            `
        }
        function rateDetails(rates) {
            let rowsOfRate = ``;
            rates.forEach(item => {
                let service = rateFeeTypes.filter(rateFeeType => {
                    return rateFeeType.RateTypeId == item.rateType;
                })[0].RateType;
                let rateType = rateFeeTypes.filter(rateFeeType => {
                    return rateFeeType.FeeTypeId == item.unitType;
                })[0].FeeType;
                rowsOfRate += `
                <tr>
                    <td>${service}</td>
                    <td>${rateType}</td>
                    <td>${item.rate}</td>
                    <td>${item.unitTypeAmount}</td>
                    <td>${item.cost}</td>
                </tr>
                `
            })
            return `
            <table class="table table-sm table-hover" style="width:100%">
                <thead>
                    <td><strong>Service</strong></td>
                    <td><strong>Rate Type</strong></td>
                    <td><strong>Rate</strong></td>
                    <td><strong>Quantity</strong></td>
                    <td><strong>Cost</strong></td>
                </thead>
                <tbody>
                    ${rowsOfRate}
                </tbody>
            </table>
            `
        }
    }
}

function openCreateBillsModal(BOLId) {
    $('#CommercialCreateBillsModal').modal('show');
    $('#CommercialCreateBillsBtn').off('click');
    $('#CommercialCreateBillsBtn').on('click', () => {
        const BOLObject = masters.filter(item => {
            return item.id == BOLId;
        })[0];
        let jsondoc = { jsondoc: JSON.stringify(BOLObject) };
        $.ajax({
            url: api.createBOLNumber.url,
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(jsondoc),
            headers: api.createBOLNumber.key,
            processData: false,
            success: function( data, textStatus, xhr ){
                BOLObject.BOLNumber = data;
                jsondoc = {
                    jsondoc: JSON.stringify(BOLObject),
                    transactionType: 'BOL CREATED',
                    username: 'qatester'
                }
                $.ajax({
                    url: api.updateBOLTransaction.url,
                    dataType: 'json',
                    type: 'post',
                    contentType: 'application/json',
                    data: JSON.stringify(jsondoc),
                    headers: api.updateBOLTransaction.key,
                    processData: false,
                    success: function( data, textStatus, xhr ){
                        console.log(data);
                    },
                    error: function(xhr, textStatus, errorThrown ){
                        console.log( {errorThrown} );
                        alert("Error inserting booking transaction account: " + textStatus + " : " + errorThrown);
                    },
                    complete: function(){
                        $('#CommercialCreateBillsModal').modal('hide');
                        //Disabling the Insert Booking Spinner
                        // $('#createBookingSpinner').css('display','none');
                        // $('#createBookingButton').removeAttr('disabled');
                        // readBookingTransactions();
                        readBillsOfLading();
                    }
                });
            },
            error: function(xhr, textStatus, errorThrown ){
                console.log( {errorThrown} );
                alert("Error inserting booking transaction account: " + textStatus + " : " + errorThrown);
            },
            complete: function(){
                //Disabling the Insert Booking Spinner
                // $('#createBookingSpinner').css('display','none');
                // $('#createBookingButton').removeAttr('disabled');
                // readBookingTransactions();
                console.log('done');
            }
        });
    })
}

function openMassCreateBillsModal() {
    $('#CommercialCreateBillsModal').modal('show');
    $('#CommercialCreateBillsBtn').off('click');
    $('#CommercialCreateBillsBtn').on('click', function() {
        for(let i = 0; i < MastersTable.rows('.selected').data().length; i++) {
            let BOLObject = MastersTable.rows('.selected').data()[i];
            let jsondoc = { jsondoc: JSON.stringify(BOLObject) };
            $.ajax({
                url: api.createBOLNumber.url,
                dataType: 'json',
                type: 'post',
                contentType: 'application/json',
                data: JSON.stringify(jsondoc),
                headers: api.createBOLNumber.key,
                processData: false,
                success: function( data, textStatus, xhr ){
                    BOLObject.BOLNumber = data;
                    jsondoc = {
                        jsondoc: JSON.stringify(BOLObject),
                        transactionType: 'BOL CREATED',
                        username: 'qatester'
                    }
                    $.ajax({
                        url: api.updateBOLTransaction.url,
                        dataType: 'json',
                        type: 'post',
                        contentType: 'application/json',
                        data: JSON.stringify(jsondoc),
                        headers: api.updateBOLTransaction.key,
                        processData: false,
                        success: function( data, textStatus, xhr ){
                            console.log(data);
                        },
                        error: function(xhr, textStatus, errorThrown ){
                            console.log( {errorThrown} );
                            alert("Error inserting booking transaction account: " + textStatus + " : " + errorThrown);
                        },
                        complete: function(){
                            //Disabling the Insert Booking Spinner
                            // $('#createBookingSpinner').css('display','none');
                            // $('#createBookingButton').removeAttr('disabled');
                            // readBookingTransactions();
                            readBillsOfLading();
                        }
                    });
                },
                error: function(xhr, textStatus, errorThrown ){
                    console.log( {errorThrown} );
                    alert("Error inserting booking transaction account: " + textStatus + " : " + errorThrown);
                },
                complete: function(){
                    //Disabling the Insert Booking Spinner
                    // $('#createBookingSpinner').css('display','none');
                    // $('#createBookingButton').removeAttr('disabled');
                    // readBookingTransactions();
                }
            });
        }
        $('#CommercialCreateBillsModal').modal('hide');
        readBillsOfLading();
    });
}

function openEditMastersModal(BOLId) {
    const GeneralState = {
        BOLStatus: 1,
        FreightTerm: 1,
        CarrierBookingRef: false,
        ExportRef: false,
        Forwarder: false,
        ForwarderAccount: false,
        ForwarderName: false,
        ForwarderEmail: false,
        ForwarderPhone: false,
        ForwarderFax: false,
        Shipper: false,
        ShipperAccount: false,
        ShipperName: false,
        ShipperEmail: false,
        ShipperPhone: false,
        ShipperFax: false,
        Consignee: false,
        ConsigneeAccount: false,
        ConsigneeName: false,
        ConsigneeEmail: false,
        ConsigneePhone: false,
        ConsigneeFax: false,
        Notify: false,
        NotifyAccount: false,
        NotifyName: false,
        NotifyEmail: false,
        NotifyPhone: false,
        NotifyFax: false,
        POL: false,
        POD: false,
        Vessel: false,
        Voyage: false,
        Captain: false,
        DeclarationOfValue: false,
        NRT: false,
        GRT: false,
        isValid: function() {
            return true;
        },
        StartState: function() {
            this.BOLStatus = BOLObject.status;
            this.FreightTerm = BOLObject.freightTerms;
            this.CarrierBookingRef = BOLObject.carrierBookingRef;
            this.ExportRef = BOLObject.exportReference;
            this.Forwarder = BOLObject.forwarder.name;
            this.ForwarderAccount = BOLObject.forwarder.address;
            this.ForwarderName = BOLObject.forwarder.contact.name;
            this.ForwarderEmail = BOLObject.forwarder.contact.email;
            this.ForwarderPhone = BOLObject.forwarder.contact.phone;
            this.ForwarderFax = BOLObject.forwarder.contact.fax;
            this.Shipper = BOLObject.shipper.name;
            this.ShipperAccount = BOLObject.shipper.address;
            this.ShipperName = BOLObject.shipper.contact.name;
            this.ShipperEmail = BOLObject.shipper.contact.email;
            this.ShipperPhone = BOLObject.shipper.contact.phone;
            this.ShipperFax = BOLObject.shipper.contact.fax;
            this.Consignee = BOLObject.consignee.name;
            this.ConsigneeAccount = BOLObject.consignee.address;
            this.ConsigneeName = BOLObject.consignee.contact.name;
            this.ConsigneeEmail = BOLObject.consignee.contact.email;
            this.ConsigneePhone = BOLObject.consignee.contact.phone;
            this.ConsigneeFax = BOLObject.consignee.contact.fax;
            this.Notify = BOLObject.notifyParty.name;
            this.NotifyAccount = BOLObject.notifyParty.address;
            this.NotifyName = BOLObject.notifyParty.contact.name;
            this.NotifyEmail = BOLObject.notifyParty.contact.email;
            this.NotifyPhone = BOLObject.notifyParty.contact.phone;
            this.NotifyFax = BOLObject.notifyParty.contact.fax;
            this.POL = BOLObject.POL;
            this.POD = BOLObject.POD;
            this.Vessel = BOLObject.vessel;
            this.Voyage = BOLObject.voyageNum;
            this.Captain = BOLObject.captain;
            this.DeclarationOfValue = BOLObject.declarationOfValue;
            this.NRT = BOLObject.NRT;
            this.GRT = BOLObject.GRT;
        }
    };
    const CargoState = {
        Cargo: [],
        StartState: function() {
            this.Cargo = [];
            BOLObject.cargo.forEach(item => {
                this.Cargo.push(item);
            });
        },
        isValid: function() {
            return true;
        }
    };
    const RateState = {
        CargoRates: [],
        BOLRates: [],
        StartState: function() {
            this.CargoRates = [];
            this.BOLRates = [];
            BOLObject.setTotalRates();
            BOLObject.cargoRates.forEach(item => {
                this.CargoRates.push(item);
            });
            BOLObject.BOLRates.forEach(item => {
                this.BOLRates.push(item);
            });
        },
        isValid: function() {
            return true;
        }
    };
    const OptionState = {
        ShowCBM: true,
        ShowWeights: true,
        ShowFreightForwarder: true,
        Freighted: true,
        RoundWeight: 2,
        RoundCBM: 2,
        StartState: function() {
            this.ShowCBM = BOLObject.showCBM ? BOLObject.showCBM : true;
            this.ShowWeights = BOLObject.showWeights ? BOLObject.showWeights : true;
            this.ShowFreightForwarder = BOLObject.showFreightForwarder ? BOLObject.showFreightForwarder : true;
            this.Freighted = BOLObject.freighted ? BOLObject.freighted : true;
            this.RoundWeight = BOLObject.roundWeight ? BOLObject.roundWeight : 2;
            this.RoundCBM = BOLObject.roundCBM ? BOLObject.roundCBM : 2;
        }
    }
    const BOLObject = new BillOfLading(masters.filter(item => {
        return item.id == BOLId;
    })[0]);

    $('#EditCommercialBOLModal').modal('show');
    showModalTabGeneral();

    
    function showModalTabGeneral() {
        GeneralState.StartState();
        //Setting the template
        $('#EditCommercialBOLBody').html($('#EditCommercialBOLGeneralTabTemplate').html());
        //Setting text on submit button to be submit or next
        $('#EditCommercialBOLBtn').html('Next');
        $('#EditCommercialBOLBtn').off('click');
        $('#EditCommercialBOLBtn').on('click', function() {
            if(GeneralState.isValid()) {
                saveGeneralTab();
                showModalTabCargo();
            }
        });
        //Change btn-secondary and btn-primary on the tabs
        $('#EditCommercialBOLGeneralTab').removeClass('btn-secondary');
        $('#EditCommercialBOLGeneralTab').addClass('btn-primary');
        $('#EditCommercialBOLGeneralTab').off('click');
        $('#EditCommercialBOLCargoTab').removeClass('btn-primary');
        $('#EditCommercialBOLCargoTab').addClass('btn-secondary');
        $('#EditCommercialBOLCargoTab').off('click');
        $('#EditCommercialBOLCargoTab').on('click', () => {
            if(GeneralState.isValid()) {
                saveGeneralTab();
                showModalTabCargo();
            }
        });
        $('#EditCommercialBOLRatesTab').removeClass('btn-primary');
        $('#EditCommercialBOLRatesTab').addClass('btn-secondary');
        $('#EditCommercialBOLRatesTab').off('click');
        $('#EditCommercialBOLRatesTab').on('click', () => {
            if(GeneralState.isValid()) {
                saveGeneralTab();
                showModalTabRates();
            }
        });
        $('#EditCommercialBOLOptionsTab').removeClass('btn-primary');
        $('#EditCommercialBOLOptionsTab').addClass('btn-secondary');
        $('#EditCommercialBOLOptionsTab').off('click');
        $('#EditCommercialBOLOptionsTab').on('click', () => {
            if(GeneralState.isValid()) {
                saveGeneralTab();
                showModalTabOptions();
            }
        });

        //Setting up BOL Status
        $('#ECBBOLStatus').html('');
        BOLStatuses.forEach(item => {
            $('#ECBBOLStatus').append(`<option value="${item.id}">${item.description}</option>`);
        });
        $('#ECBBOLStatus').off('change');
        $('#ECBBOLStatus').on('change', () => {
            GeneralState.BOLStatus = $('#ECBBOLStatus').val();
        });
        //Setting up Freight Terms
        $('#ECBGeneralFreightTerms').html('');
        freightTerms.forEach(item => {
            $('#ECBGeneralFreightTerms').append(`<option value="${item.id}">${item.freightTerm}</option>`);
        })
        $('#ECBGeneralFreightTerms').off('change');
        $('#ECBGeneralFreightTerms').on('change', () => {
            GeneralState.FreightTerm = $('#ECBGeneralFreightTerms').val();
        });
        //Carrier Booking Ref
        $('#ECBCarrierBookingRef').off('change');
        $('#ECBCarrierBookingRef').on('change', () => {
            GeneralState.CarrierBookingRef = $('#ECBCarrierBookingRef').val();
        });
        //Export Ref
        $('#ECBExportRef').off('change');
        $('#ECBExportRef').on('change', () => {
            GeneralState.ExportRef = $('#ECBExportRef').val();
        });
        //Forwarder
        $("#ECBForwarder").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#ECBForwarder').val();
                });
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#ECBForwarderError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Forwarder = $('#ECBForwarder').val();
                    populateAccountDiv(customer[0], 'Forwarder');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#ECBForwarderAccountDiv').html('');
                    $('#ECBForwarderError').text(`There are multiple customers named '${$('#ECBForwarder').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Forwarder = false;
                //If no customers are found
                } else {
                    $('#ECBForwarderAccountDiv').html('');
                    $('#ECBForwarderError').text(`'${$('#ECBForwarder').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Forwarder = false;
                }
            }
        });
        $("#ECBForwarder").autocomplete('widget').css('z-index', 2000);
        $('#ECBForwarderName').off('change');
        $('#ECBForwarderName').on('change', function() {
            GeneralState.ForwarderName = $(this).val();
        });
        $('#ECBForwarderEmail').off('change');
        $('#ECBForwarderEmail').on('change', function() {
            GeneralState.ForwarderEmail = $(this).val();
        });
        $('#ECBForwarderPhone').off('change');
        $('#ECBForwarderPhone').on('change', function() {
            GeneralState.ForwarderPhone = $(this).val();
        });
        $('#ECBForwarderFax').off('change');
        $('#ECBForwarderFax').on('change', function() {
            GeneralState.ForwarderFax = $(this).val();
        });
        //Shipper
        $("#ECBShipper").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#ECBShipper').val();
                });
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#ECBShipperError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Shipper = $('#ECBShipper').val();
                    populateAccountDiv(customer[0], 'Shipper');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#AccountDiv').html('');
                    $('#ECBShipperError').text(`There are multiple customers named '${$('#ECBShipper').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Shipper = false;
                //If no customers are found
                } else {
                    $('#AccountDiv').html('');
                    $('#ECBShipperError').text(`'${$('#ECBShipper').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Shipper = false;
                }
            }
        });
        $("#ECBShipper").autocomplete('widget').css('z-index', 2000);
        $('#ECBShipperName').off('change');
        $('#ECBShipperName').on('change', function() {
            GeneralState.ShipperName = $(this).val();
        });
        $('#ECBShipperEmail').off('change');
        $('#ECBShipperEmail').on('change', function() {
            GeneralState.ShipperEmail = $(this).val();
        });
        $('#ECBShipperPhone').off('change');
        $('#ECBShipperPhone').on('change', function() {
            GeneralState.ShipperPhone = $(this).val();
        });
        $('#ECBShipperFax').off('change');
        $('#ECBShipperFax').on('change', function() {
            GeneralState.ShipperFax = $(this).val();
        });
        //Consignee
        $("#ECBConsignee").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#ECBConsignee').val();
                })
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#ECBConsigneeError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Consignee = $('#ECBConsignee').val();
                    populateAccountDiv(customer[0], 'Consignee');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#ECBConsigneeAccountDiv').html('');
                    $('#ECBConsigneeError').text(`There are multiple customers named '${$('#ECBConsignee').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Consignee = false;
                //If no customers are found
                } else {
                    $('#ECBConsigneeAccountDiv').html('');
                    $('#ECBConsigneeError').text(`'${$('#ECBConsignee').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Consignee = false;
                }
            }
        });
        $("#ECBConsignee").autocomplete('widget').css('z-index', 2000);
        $('#ECBConsigneeName').off('change');
        $('#ECBConsigneeName').on('change', function() {
            GeneralState.ConsigneeName = $(this).val();
        });
        $('#ECBConsigneeEmail').off('change');
        $('#ECBConsigneeEmail').on('change', function() {
            GeneralState.ConsigneeEmail = $(this).val();
        });
        $('#ECBConsigneePhone').off('change');
        $('#ECBConsigneePhone').on('change', function() {
            GeneralState.ConsigneePhone = $(this).val();
        });
        $('#ECBConsigneeFax').off('change');
        $('#ECBConsigneeFax').on('change', function() {
            GeneralState.ConsigneeFax = $(this).val();
        });
        //Notify Party
        $("#ECBNotify").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#ECBNotify').val();
                })
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#ECBNotifyError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Notify = $('#ECBNotify').val();
                    populateAccountDiv(customer[0], 'Notify');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#ECBNotifyAccountDiv').html('');
                    $('#ECBNotifyError').text(`There are multiple customers named '${$('#ECBNotify').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Notify = false;
                //If no customers are found
                } else {
                    $('#ECBNotifyAccountDiv').html('');
                    $('#ECBNotifyError').text(`'${$('#ECBNotify').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Notify = false;
                }
            }
        });
        $("#ECBNotify").autocomplete('widget').css('z-index', 2000);
        $('#ECBNotifyName').off('change');
        $('#ECBNotifyName').on('change', function() {
            GeneralState.NotifyName = $(this).val();
        });
        $('#ECBNotifyEmail').off('change');
        $('#ECBNotifyEmail').on('change', function() {
            GeneralState.NotifyEmail = $(this).val();
        });
        $('#ECBNotifyPhone').off('change');
        $('#ECBNotifyPhone').on('change', function() {
            GeneralState.NotifyPhone = $(this).val();
        });
        $('#ECBNotifyFax').off('change');
        $('#ECBNotifyFax').on('change', function() {
            GeneralState.NotifyFax = $(this).val();
        });
        //POL
        $("#ECBPOL").autocomplete({
            source: ports,
            change: function( event, ui ) {
                //Filters through ports to see if port name entered is valid
                let port = ports.filter(port => {
                    return port.Name === $('#ECBPOL').val();
                });
                //If 1 port is found
                if(port.length === 1) {
                    $('#ECBPOLError').text("");
                    GeneralState.POL = new Port3(port[0]);
                    $('#ECBPOL').val(GeneralState.POL.Name);
                    if($('#ECBPOL').val() == $('#ECBPOD').val()) {
                        $('.POLPODSameError').text('POL and POD can not be the same!');
                    } else {
                        $('.POLPODSameError').text('');
                    }
                //If more than 1 port is found
                } else if(port.length > 1){
                    $('#ECBPOLError').text(`There are multiple ports named '${$('#ECBPOL').val()}'. Contact the IT Department for help!`);
                    GeneralState.POL = false;
                //If no ports are found
                } else {
                    $('#ECBPOLError').text(`'${$('#ECBPOL').val()}' is not a valid port! Either type the name in correctly or Choose one from the dropdown!`);
                    GeneralState.POL = false;
                }
            }
        });
        $("#ECBPOL").autocomplete('widget').css('z-index', 2000);
        //POD
        $("#ECBPOD").autocomplete({
            source: ports,
            change: function( event, ui ) {
                //Filters through ports to see if port name entered is valid
                let port = ports.filter(port => {
                    return port.Name === $('#ECBPOD').val();
                });
                //If 1 port is found
                if(port.length === 1) {
                    $('#ECBPODError').text("");
                    GeneralState.POD = new Port3(port[0]);
                    $('#ECBPOD').val(GeneralState.POD.Name);
                    if($('#ECBPOL').val() == $('#ECBPOD').val()) {
                        $('.POLPODSameError').text('POL and POD can not be the same!');
                    } else {
                        $('.POLPODSameError').text('');
                    }
                //If more than 1 port is found
                } else if(port.length > 1){
                    $('#ECBPODError').text(`There are multiple ports named '${$('#ECBPOD').val()}'. Contact the IT Department for help!`);
                    GeneralState.POL = false;
                //If no ports are found
                } else {
                    $('#ECBPODError').text(`'${$('#ECBPOD').val()}' is not a valid port! Either type the name in correctly or Choose one from the dropdown!`);
                    GeneralState.POL = false;
                }
            }
        });
        $("#ECBPOD").autocomplete('widget').css('z-index', 2000);
        //Vessel
        $("#ECBVessel").autocomplete({
            source: vessels,
            change: function( event, ui ) {
                //Filters through vessels to see if vessel name entered is valid
                let vessel = vessels.filter(vessel => {
                    return vessel.Name === $('#ECBVessel').val();
                })
                //If 1 vessel is found
                if(vessel.length === 1) {
                    $('#ECBVesselError').text("");
                    GeneralState.Vessel = new Vessel3(vessel[0]);
                    $('#ECBVessel').val(GeneralState.Vessel.Name);
                //If more than 1 vessel is found
                } else if(vessel.length > 1){
                    $('#ECBVesselError').text(`There are multiple vessels named '${$('#ECBVessel').val()}'. Contact the IT Department for help!`);
                    GeneralState.Vessel = false;
                //If no vessels are found
                } else {
                    $('#ECBVesselError').text(`'${$('#ECBVessel').val()}' is not a valid vessel! Either type the name in correctly or Choose one from the dropdown!`);
                    GeneralState.Vessel = false;
                }
            }
        });
        $("#ECBVessel").autocomplete('widget').css('z-index', 2000); 
        //Voyage
        $('#ECBVoyage').off('change');
        $('#ECBVoyage').on('change', () => {
            if(parseInt($('#ECBVoyage')) < 0) {
                $('#ECBVoyageError').text('Voyage Number can not be below 0!');
                GeneralState.Voyage = false;
            } else {
                $('#ECBVoyageError').text('');
                GeneralState.Voyage = $('#ECBVoyage').val();
            }
        });
        //Captain
        $('#ECBCaptain').off('change');
        $('#ECBCaptain').on('change', () => {
            GeneralState.Captain = $('#ECBCaptain').val();
        });
        //Declaration Of Value
        $('#ECBDeclarationOfValue').off('change');
        $('#ECBDeclarationOfValue').on('change', () => {
            GeneralState.DeclarationOfValue = $('#ECBDeclarationOfValue').val();
        }); 
        //NRT
        $('#ECBNRT').off('change');
        $('#ECBNRT').on('change', () => {
            GeneralState.NRT = $('#ECBNRT').val();
        });
        //GRT
        $('#ECBGRT').off('change');
        $('#ECBGRT').on('change', () => {
            GeneralState.GRT = $('#ECBGRT').val();
        });
        accountOnClick();
        loadGeneralTab();


        function loadGeneralTab() {
            $('#ECBBOLStatus').val(GeneralState.BOLStatus);
            $('#ECBBOLStatus').change();
            $('#ECBGeneralFreightTerms').val(GeneralState.FreightTerm);
            $('#ECBGeneralFreightTerms').change();
            $('#ECBCarrierBookingRef').val(GeneralState.CarrierBookingRef);
            $('#ECBCarrierBookingRef').change();
            $('#ECBExportRef').val(GeneralState.ExportRef);
            $('#ECBExportRef').change();
            //Forwarder
            $('#ECBForwarder').val(GeneralState.Forwarder);
            let customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Forwarder;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Forwarder'); 
                $(`input[accountType="Forwarder"][value="${GeneralState.ForwarderAccount.accountId}"]`).attr('checked', true);
            }
            $('#ECBForwarderName').val(GeneralState.ForwarderName);
            $('#ECBForwarderEmail').val(GeneralState.ForwarderEmail);
            $('#ECBForwarderPhone').val(GeneralState.ForwarderPhone);
            $('#ECBForwarderFax').val(GeneralState.ForwarderFax);
            //Shipper
            $('#ECBShipper').val(GeneralState.Shipper);
            customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Shipper;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Shipper'); 
                $(`input[accountType="Shipper"][value="${GeneralState.ShipperAccount.accountId}"]`).attr('checked', true);
            }
            $('#ECBShipperName').val(GeneralState.ShipperName);
            $('#ECBShipperEmail').val(GeneralState.ShipperEmail);
            $('#ECBShipperPhone').val(GeneralState.ShipperPhone);
            $('#ECBShipperFax').val(GeneralState.ShipperFax);
            //Consignee
            $('#ECBConsignee').val(GeneralState.Consignee);
            customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Consignee;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Consignee'); 
                $(`input[accountType="Consignee"][value="${GeneralState.ConsigneeAccount.accountId}"]`).attr('checked', true);
            }
            $('#ECBConsigneeName').val(GeneralState.ConsigneeName);
            $('#ECBConsigneeEmail').val(GeneralState.ConsigneeEmail);
            $('#ECBConsigneePhone').val(GeneralState.ConsigneePhone);
            $('#ECBConsigneeFax').val(GeneralState.ConsigneeFax);
            //Notify Party
            $('#ECBNotify').val(GeneralState.Notify);
            customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Notify;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Notify'); 
                $(`input[accountType="Notify"][value="${GeneralState.NotifyAccount.accountId}"]`).attr('checked', true);
            }
            $('#ECBNotifyName').val(GeneralState.NotifyName);
            $('#ECBNotifyEmail').val(GeneralState.NotifyEmail);
            $('#ECBNotifyPhone').val(GeneralState.NotifyPhone);
            $('#ECBNotifyFax').val(GeneralState.NotifyFax);
            $('#ECBPOL').val(GeneralState.POL.Name);
            $('#ECBPOL').change();
            $('#ECBPOD').val(GeneralState.POL.Name);
            $('#ECBPOD').change();
            $('#ECBVessel').val(GeneralState.Vessel.Name);
            $('#ECBVessel').change(); 
            $('#ECBVoyage').val(GeneralState.Voyage);
            $('#ECBVoyage').change(); 
            $('#ECBCaptain').val(GeneralState.Captain);
            $('#ECBCaptain').change(); 
            $('#ECBDeclarationOfValue').val(GeneralState.DeclarationOfValue);
            $('#ECBDeclarationOfValue').change();
            $('#ECBNRT').val(GeneralState.NRT);
            $('#ECBNRT').change(); 
            $('#ECBGRT').val(GeneralState.GRT);
            $('#ECBGRT').change();
        }
        //Helper Functions
        //Helper Function for loading the addresses once the customer has been selected
        function populateAccountDiv(customer, account){
            $(`#ECB${account}AccountDiv`).html('');
            for (var i = 0; i < customer.accountList.length; i++) {
                $(`#ECB${account}AccountDiv`).append(
                    `<div class="form-check mt-1 mb-1">
                        <input id="${account}AccountRadios${customer.accountList[i].accountID}" class="form-check-input AccountRadios" type="radio" value="${customer.accountList[i].accountID}" accountType="${account}" name="${account}AccountRadios" customer="${customer.customerID}">
                        <label class="form-check-label" for="${account}AccountRadios${customer.accountList[i].accountID}">
                            ${getAddressFromAccount(customer.accountList[i])}
                        </label>
                    </div>`
                );
            }
            accountOnClick();
            //Helper Function for populateAccountDiv()
            //Creates the Address String with Account Name(If applicable) and returns it
            function getAddressFromAccount(account) {
                return `${account.accountName ? account.accountName + ": <br><p class='pl-3 mb-0' style='font-size:85%'>" : "<p class='mb-0'>"}
                        ${account.address1}, ${account.city} ${account.state} ${account.zip}, 
                        ${account.country}${account.accountName ? '</p>' : "</p>"}`;
            }
        }
        function accountOnClick() {
            $('.AccountRadios').off('click');
            $('.AccountRadios').on('click', function() {
                const tmpCustomer = customerList.filter(item => {
                    return item.customerID == $(this).attr('customer');
                })[0];
                const tmpAccount = tmpCustomer.accountList.filter(item => {
                    return item.accountID == $(this).attr('value');
                })[0];
                const tmpAddress = new Account3({
                    accountId: tmpAccount.accountID ? tmpAccount.accountID : null,
                    accountName: tmpAccount.accountName ? tmpAccount.accountName : null,
                    address1: tmpAccount.address1 ? tmpAccount.address1 : null,
                    address2: tmpAccount.address2 ? tmpAccount.address2 : null,
                    addressId: tmpAccount.addressID ? tmpAccount.addressID : null,
                    addressTypeId: tmpAccount.addressTypeID ? tmpAccount.addressTypeID : null,
                    city: tmpAccount.city ? tmpAccount.city : null,
                    country: tmpAccount.country ? tmpAccount.country : null,
                    state: tmpAccount.state ? tmpAccount.state : null,
                    zip: tmpAccount.zip ? tmpAccount.zip : null
                });
                switch($(this).attr('accountType')) {
                    case 'Forwarder':
                        GeneralState.ForwarderAccount = tmpAddress;
                        break;
                    case 'Shipper':
                        GeneralState.ShipperAccount = tmpAddress;
                        break;
                    case 'Consignee':
                        GeneralState.ConsigneeAccount = tmpAddress;
                        break;
                    case 'Notify':
                        GeneralState.NotifyAccount = tmpAddress;
                        break;
                }
            });
        }
    }
    function saveGeneralTab() {
        BOLObject.status = GeneralState.BOLStatus;
        BOLObject.freightTerms = GeneralState.FreightTerm;
        BOLObject.carrierBookingRef = GeneralState.CarrierBookingRef;
        BOLObject.exportReference = GeneralState.ExportRef;
        BOLObject.forwarder.name = GeneralState.Forwarder;
        BOLObject.forwarder.address = GeneralState.ForwarderAccount;
        BOLObject.forwarder.contact.name = GeneralState.ForwarderName;
        BOLObject.forwarder.contact.email = GeneralState.ForwarderEmail;
        BOLObject.forwarder.contact.phone  = GeneralState.ForwarderPhone;
        BOLObject.forwarder.contact.fax = GeneralState.ForwarderFax;
        BOLObject.consignee.name = GeneralState.Consignee;
        BOLObject.consignee.address = GeneralState.ConsigneeAccount;
        BOLObject.consignee.contact.name = GeneralState.ConsigneeName;
        BOLObject.consignee.contact.email = GeneralState.ConsigneeEmail;
        BOLObject.consignee.contact.phone = GeneralState.ConsigneePhone;
        BOLObject.consignee.contact.fax = GeneralState.ConsigneeFax;
        BOLObject.notifyParty.name = GeneralState.Notify;
        BOLObject.notifyParty.address = GeneralState.NotifyAccount;
        BOLObject.notifyParty.contact.name = GeneralState.NotifyName;
        BOLObject.notifyParty.contact.email = GeneralState.NotifyEmail;
        BOLObject.notifyParty.contact.phone = GeneralState.NotifyPhone;
        BOLObject.notifyParty.contact.fax = GeneralState.NotifyFax;
        BOLObject.shipper.name = GeneralState.Shipper;
        BOLObject.shipper.address = GeneralState.ShipperAccount;
        BOLObject.shipper.contact.name = GeneralState.ShipperName;
        BOLObject.shipper.contact.email = GeneralState.ShipperEmail;
        BOLObject.shipper.contact.phone = GeneralState.ShipperPhone;
        BOLObject.shipper.contact.fax = GeneralState.ShipperFax;
        BOLObject.POL = GeneralState.POL;
        BOLObject.POD = GeneralState.POD;
        BOLObject.vessel = GeneralState.Vessel;
        BOLObject.voyageNum = GeneralState.Voyage;
        BOLObject.captain = GeneralState.Captain;
        BOLObject.declarationOfValue = GeneralState.DeclarationOfValue;
        BOLObject.NRT = GeneralState.NRT;
        BOLObject.GRT = GeneralState.GRT;
    }
    function showModalTabCargo() {
        CargoState.StartState();
        //Setting the template
        $('#EditCommercialBOLBody').html($('#EditCommercialBOLCargoTabTemplate').html());
        //Change btn-secondary and btn-primary on the tabs
        $('#EditCommercialBOLGeneralTab').removeClass('btn-primary');
        $('#EditCommercialBOLGeneralTab').addClass('btn-secondary');
        $('#EditCommercialBOLGeneralTab').off('click');
        $('#EditCommercialBOLGeneralTab').on('click', () => {
            saveCargoTab();
            showModalTabGeneral();
        });
        $('#EditCommercialBOLCargoTab').removeClass('btn-secondary');
        $('#EditCommercialBOLCargoTab').addClass('btn-primary');
        $('#EditCommercialBOLCargoTab').off('click');
        $('#EditCommercialBOLRatesTab').removeClass('btn-primary');
        $('#EditCommercialBOLRatesTab').addClass('btn-secondary');
        $('#EditCommercialBOLRatesTab').off('click');
        $('#EditCommercialBOLRatesTab').on('click', () => {
            saveCargoTab();
            showModalTabRates();
        });
        $('#EditCommercialBOLOptionsTab').removeClass('btn-primary');
        $('#EditCommercialBOLOptionsTab').addClass('btn-secondary');
        $('#EditCommercialBOLOptionsTab').off('click');
        $('#EditCommercialBOLOptionsTab').on('click', () => {
            saveCargoTab();
            showModalTabOptions();
        });

        //Setting text on submit button to be submit or next
        $('#EditCommercialBOLBtn').html('Next');
        $('#EditCommercialBOLBtn').off('click');
        $('#EditCommercialBOLBtn').on('click', () => {
            saveCargoTab();
            showModalTabRates();
        });
        //Add Cargo Button
        $('#ECBAddCargoBtn').off('click');
        $('#ECBAddCargoBtn').on('click', () => {
            openAddCargoModal();
        });
        drawTable();

        function openAddCargoModal() {
            $('#CommercialMastersAddCargoModal').modal('show');
            //Fading in/out the original modal
            $('#CommercialMastersAddCargoModal').on('hidden.bs.modal', function () {
                $('#CommercialMastersModal').attr('style', '9999; display: block;');
            })
            $('#CommercialMastersModal').attr('style', 'z-index: 999; display: block;');

            //Filtering the available cargo to select
            const filteredCargo = commercialCargo.filter(item => {
                if(item.bookingNumber == BOLObject.carrierBookingRef
                && item.POL.port.id == BOLObject.POL.id
                && item.POD.port.id == BOLObject.POD.id) {
                    let tmp = true;
                    for(let i = 0; i < CargoState.Cargo.length; i++) {
                        if(CargoState.Cargo[i].id == item.id) {
                            tmp = false;
                        }
                    }
                    if(tmp){
                        return item;
                    }
                }
            });

            const AddCargoTable = $('#ECBAddCargoTable').DataTable({
                destroy: true,
                paging: false,
                searching: false,
                scrollX: true,
                scrollY: '40vh',
                select: {
                    style: 'multi',   
                },
                data: filteredCargo,
                columns: [
                    //VIN
                    {
                        data: 'VIN',
                        render: function(data) {
                            return data;
                        }
                    },
                    //Booking Number
                    {
                        data: 'bookingNumber',
                        render: function(data) {
                            return data;
                        }
                    },
                    //CargoStatus
                    {
                        data: 'cargoStatus',
                        render: function(data) {
                            return readReferenceTables(cargoStatuses, data).description;
                        }
                    },
                    //Description
                    {
                        data: 'cargoDescription',
                        render: function(data) {
                            return data;
                        }
                    },
                    //Forwarder
                    {
                        data: 'forwarder',
                        render: function(data) {
                            return data ? data.name : 'N/A';
                        }
                    }
                ]
            });

            $('#ECBSubmitAddCargoBtn').off('click');
            $('#ECBSubmitAddCargoBtn').on('click', () => {
                for(let i = 0; i < AddCargoTable.rows('.selected').data().length; i++) {
                    let tmp = CargoState.Cargo.findIndex(item => {
                        return item.id == AddCargoTable.rows('.selected').data()[i].id;
                    });
                    if(tmp == -1) {
                        switch(AddCargoTable.rows('.selected').data()[i].customerType) {
                            case 'M':
                                CargoState.Cargo.push(new MilitaryCargo3(AddCargoTable.rows('.selected').data()[i]));
                                break;
                            case 'C':
                                CargoState.Cargo.push(new CommercialCargo3(AddCargoTable.rows('.selected').data()[i]));
                                break;
                        }
                    }
                }
                $('#CommercialMastersAddCargoModal').modal('hide');
                drawTable();
            });
        }
        //Draws the table as well as onclicks for removing cargo
        function drawTable() {
            //Setting up the Cargo Table
            $('#ECBCargoTable').DataTable({
                destroy: true,
                paging: false,
                searching: false,
                scrollX: true,
                scrollY: '40vh',
                data: CargoState.Cargo,
                columns: [
                    //Remove
                    {
                        data: 'id',
                        className: 'align-middle',
                        render: function(data) {
                            return `<button class="CMCargoTableRemoveCargoBtn float-right btn btn-sm btn-outline-danger" cargoId="${data}"><i class="fas fa-times"></i></button>`;
                        }
                    },
                    //VIN
                    {
                        data: 'VIN',
                        render: function(data) {
                            return data;
                        }
                    },
                    //Description
                    {
                        data: 'cargoDescription',
                        render: function(data) {
                            return `<input cargoId="${data.id}" value="${data ? data : ''}" size="17">`;
                        }
                    },
                    //Length
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.lengths.m).toFixed(3);
                        }
                    },
                    //Width
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.widths.m).toFixed(3);
                        }
                    },
                    //Height
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.heights.m).toFixed(3);
                        }
                    },
                    //Weight
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.weights.mt).toFixed(3);
                        }
                    },
                    //AES ITN
                    {
                        data: function(row, type, val, meta) {
                            return row;
                        },
                        className: 'align-middle',
                        render: function(data) {
                            return `<input class="CMCargoTableAESITN" cargoId="${data.id}" value="${data.AESITN ? data.AESITN : ''}" size="10">`;
                        }
                    },
                    //HSCODE
                    {
                        data: function(row, type, val, meta) {
                            return row;
                        },
                        className: 'align-middle',
                        render: function(data) {
                            return `<input class="CMCargoTableHSCode" cargoId="${data.id}" value="${data.HSCode ? data.HSCode : ''}" size="10">`;
                        }
                    },
                    //Position
                    {
                        data: function(row, type, val, meta) {
                            return meta;
                        },
                        render: function(data) {
                            return `<button class="btn CMCargoPositionBtn" index="${data.row}" dir="up" ${data.row == 0 ? 'disabled' : ''}><i class="fas fa-angle-up"></i></button> <button class="btn CMCargoPositionBtn" index="${data.row}" dir="down" ${data.row == CargoState.Cargo.length - 1 ? 'disabled' : ''}><i class="fas fa-angle-down"></i></button>`;
                        }
                    }
                ]
            });
            //Set the on clicks and on changes and all that good stuff
            $('.ECBCargoTableRemoveCargoBtn').off('click');
            $('.ECBCargoTableRemoveCargoBtn').on('click', function() {
                let tmp = CargoState.Cargo.findIndex(item => {
                    return item.id == $(this).attr('cargoId');
                });
                if(tmp !== -1) {
                    CargoState.Cargo.splice(tmp, 1);
                }
                drawTable();
            });
            $('.ECBCargoTableAESITN').off('change');
            $('.ECBCargoTableAESITN').on('change', function() {
                let tmp = CargoState.Cargo.findIndex(item => {
                    return item.id == $(this).attr('cargoId');
                });
                if(tmp !== -1) {
                    CargoState.Cargo[tmp].AESITN = $(this).val();
                }
            });
            $('.ECBCargoTableHSCode').off('change');
            $('.ECBCargoTableHSCode').on('change', function() {
                let tmp = CargoState.Cargo.findIndex(item => {
                    return item.id == $(this).attr('cargoId');
                });
                if(tmp !== -1) {
                    CargoState.Cargo[tmp].HSCode = $(this).val();
                }
            });
            $('.ECBCargoPositionBtn').off('click');
            $('.ECBCargoPositionBtn').on('click', function() {
                let index = parseInt($(this).attr('index'));
                let tmpCargo = CargoState.Cargo[index];
                switch($(this).attr('dir')) {
                    case 'up':
                        CargoState.Cargo[index] = CargoState.Cargo[index - 1];
                        CargoState.Cargo[index - 1] = tmpCargo;
                        break;
                    case 'down':
                        CargoState.Cargo[index] = CargoState.Cargo[index + 1];
                        CargoState.Cargo[index + 1] = tmpCargo;
                        break;
                };
                console.log(CargoState);
                drawTable();
            })
        }
    }
    function saveCargoTab() {
        if(CargoState.isValid) {
            BOLObject.cargo = [];
            CargoState.Cargo.forEach(item => {
                BOLObject.cargo.push(item);
            });
        }
    }
    function showModalTabRates() {
        //Setting the template
        $('#EditCommercialBOLBody').html($('#EditCommercialBOLRatesTabTemplate').html());
        //Change btn-secondary and btn-primary on the tabs
        $('#EditCommercialBOLGeneralTab').removeClass('btn-primary');
        $('#EditCommercialBOLGeneralTab').addClass('btn-secondary');
        $('#EditCommercialBOLGeneralTab').off('click');
        $('#EditCommercialBOLGeneralTab').on('click', () => {
            showModalTabGeneral();
        });
        $('#EditCommercialBOLCargoTab').removeClass('btn-primary');
        $('#EditCommercialBOLCargoTab').addClass('btn-secondary');
        $('#EditCommercialBOLCargoTab').off('click');
        $('#EditCommercialBOLCargoTab').on('click', () => {
            showModalTabCargo();
        });
        $('#EditCommercialBOLRatesTab').removeClass('btn-secondary');
        $('#EditCommercialBOLRatesTab').addClass('btn-primary');
        $('#EditCommercialBOLRatesTab').off('click');
        $('#EditCommercialBOLRatesTab').on('click', () => {
            showModalTabRates();
        });
        $('#EditCommercialBOLOptionsTab').removeClass('btn-primary');
        $('#EditCommercialBOLOptionsTab').addClass('btn-secondary');
        $('#EditCommercialBOLOptionsTab').off('click');
        $('#EditCommercialBOLOptionsTab').on('click', () => {
            showModalTabOptions();
        });

        $('#ECBAddRatesBtn').off('click');
        $('#ECBAddRatesBtn').on('click', function() {
            openAddRatesModal();
        });

        //Setting text on submit button to be submit or next
        $('#EditCommercialBOLBtn').html('Next');
        $('#EditCommercialBOLBtn').off('click');
        $('#EditCommercialBOLBtn').on('click', () => {
            showModalTabOptions();
        });

        RateState.StartState();

        $('#ECBRatesTable').DataTable({
            destroy: true,
            data: RateState.CargoRates.concat(RateState.BOLRates),
            columns: [
                //Actions
                {
                    data: 'rateType',
                    render: function(data) {
                        return `
                        <button class="btn btn-sm">
                            <i class="fas fa-edit" title="Edit"></i>
                        </button>`
                    }
                },
                //Service
                {
                    data: 'rateType',
                    render: function(data) {
                        let tmp = rateFeeTypes.filter(item => {
                            return item.RateTypeId == data;
                        })[0];
                        return tmp.RateType;
                    }
                },
                //Rate Type
                {
                    data: 'unitType',
                    render: function(data) {
                        let tmp = rateFeeTypes.filter(item => {
                            return item.FeeTypeId == data;
                        })[0];
                        return tmp.FeeType;
                    }
                },
                //Rate
                {
                    data: 'rate',
                    render: function(data) {
                        return data;
                    }
                },
                //Quantity
                {
                    data: 'unitTypeAmount',
                    render: function(data) {
                        return data;
                    }
                },
                //Total
                {
                    data: 'cost',
                    render: function(data) {
                        return data;
                    }
                }
            ]
        });

        function openAddRatesModal() {
            $('#CommercialMastersAddRatesModal').modal('show');
            //Fading in/out the original modal
            $('#CommercialMastersAddRatesModal').on('hidden.bs.modal', function () {
                $('#CommercialMastersModal').attr('style', '9999; display: block;');
            })
            $('#CommercialMastersModal').attr('style', 'z-index: 999; display: block;');
            
            $('#ECBAddRate').appent('<option>Test options</option>');
        }
    }
    function showModalTabOptions() {
        OptionState.StartState();
        //Setting the template
        $('#EditCommercialBOLBody').html($('#EditCommercialBOLOptionsTabTemplate').html());
        //Change btn-secondary and btn-primary on the tabs
        $('#EditCommercialBOLGeneralTab').removeClass('btn-primary');
        $('#EditCommercialBOLGeneralTab').addClass('btn-secondary');
        $('#EditCommercialBOLGeneralTab').off('click');
        $('#EditCommercialBOLGeneralTab').on('click', () => {
            showModalTabGeneral();
        });
        $('#EditCommercialBOLCargoTab').removeClass('btn-primary');
        $('#EditCommercialBOLCargoTab').addClass('btn-secondary');
        $('#EditCommercialBOLCargoTab').off('click');
        $('#EditCommercialBOLCargoTab').on('click', () => {
            showModalTabCargo();
        });
        $('#EditCommercialBOLRatesTab').removeClass('btn-primary');
        $('#EditCommercialBOLRatesTab').addClass('btn-secondary');
        $('#EditCommercialBOLRatesTab').off('click');
        $('#EditCommercialBOLRatesTab').on('click', () => {
            showModalTabRates();
        });
        $('#EditCommercialBOLOptionsTab').removeClass('btn-secondary');
        $('#EditCommercialBOLOptionsTab').addClass('btn-primary');
        $('#EditCommercialBOLOptionsTab').off('click');
        $('#EditCommercialBOLOptionsTab').on('click', () => {
            showModalTabOptions();
        });

        $('#ECBShowCBM').off('change');
        $('#ECBShowCBM').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.ShowCBM = true;
            } else {
                OptionState.ShowCBM = false;
            }
        });
        $('#ECBShowWeights').off('change');
        $('#ECBShowWeights').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.ShowWeights = true;
            } else {
                OptionState.ShowWeights = false;
            }
        });
        $('#ECBShowFreightForwarder').off('change');
        $('#ECBShowFreightForwarder').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.ShowFreightForwarder = true;
            } else {
                OptionState.ShowFreightForwarder = false;
            }
        });
        $('#ECBFreighted').off('change');
        $('#ECBFreighted').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.Freighted = true;
            } else {
                OptionState.Freighted = false;
            }
        });
        $('#ECBRoundWeight').off('change');
        $('#ECBRoundWeight').on('change', function() {
            OptionState.RoundWeight = $(this).val();
        });
        $('#ECBRoundCBM').off('change');
        $('#ECBRoundCBM').on('change', function() {
            OptionState.RoundCBM = $(this).val();
        });

        //Setting text on submit button to be submit or next
        $('#EditCommercialBOLBtn').html('Submit');
        $('#EditCommercialBOLBtn').off('click');
        $('#EditCommercialBOLBtn').on('click', () => {
            saveOptionsTab();
            editMastersTransaction();
        });

        loadOptionsTab();

        function loadOptionsTab() {
            console.log(OptionState);
            if(OptionState.ShowCBM) {
                $('#ECBShowCBM').prop('checked', true);
            } else {
                $('#ECBShowCBM').prop('checked', false);
            }
            if(OptionState.ShowWeights) {
                $('#ECBShowWeights').prop('checked', true);
            } else {
                $('#ECBShowWeights').prop('checked', false);
            }
            if(OptionState.ShowFreightForwarder) {
                $('#ECBShowFreightForwarder').prop('checked', true);
            } else {
                $('#ECBShowFreightForwarder').prop('checked', false);
            }
            if(OptionState.Freighted) {
                $('#ECBFreighted').prop('checked', true);
            } else {
                $('#ECBFreighted').prop('checked', false);
            }
            $('#ECBRoundWeight').val(OptionState.RoundWeight);
            $('#ECBRoundCBM').val(OptionState.RoundCBM);
        }
    }
    function saveOptionsTab() {
        BOLObject.showCBM = OptionState.ShowCBM ? OptionState.ShowCBM : false;
        BOLObject.showWeights = OptionState.ShowWeights ? OptionState.ShowWeights : false;
        BOLObject.showFreightForwarder = OptionState.ShowFreightForwarder ? OptionState.ShowFreightForwarder : false;
        BOLObject.freighted = OptionState.Freighted ? OptionState.Freighted : false;
        BOLObject.roundWeight = OptionState.RoundWeight ? OptionState.RoundWeight : 2;
        BOLObject.roundCBM = OptionState.RoundCBM ? OptionState.RoundCBM : 2;
    }
    function editMastersTransaction() {
        console.log(BOLObject);
        let jsonDoc = {
            jsondoc: JSON.stringify(BOLObject),
            transactionType: 'MASTERS EDIT',
            username: 'qatester'
        }
        console.log(jsonDoc);

        $.ajax({
            url: api.updateBOLTransaction.url,
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(jsonDoc),
            headers: api.updateBOLTransaction.key,
            processData: false,
            success: function( data, textStatus, xhr ){
                console.log(data);
                $('#EditCommercialBOLModal').modal('hide');
            },
            error: function(xhr, textStatus, errorThrown ){
                console.log( {errorThrown} );
                alert("Error inserting booking transaction account: " + textStatus + " : " + errorThrown);
            },
            complete: function(){
                //Disabling the Insert Booking Spinner
                // $('#createBookingSpinner').css('display','none');
                // $('#createBookingButton').removeAttr('disabled');
                readCargo();
                readBillsOfLading();
            }
        });
    }
}

function openEditBOLModal(BOLId) {
    const GeneralState = {
        BOLStatus: 1,
        FreightTerm: 1,
        CarrierBookingRef: false,
        ExportRef: false,
        Forwarder: false,
        ForwarderAccount: false,
        ForwarderName: false,
        ForwarderEmail: false,
        ForwarderPhone: false,
        ForwarderFax: false,
        Shipper: false,
        ShipperAccount: false,
        ShipperName: false,
        ShipperEmail: false,
        ShipperPhone: false,
        ShipperFax: false,
        Consignee: false,
        ConsigneeAccount: false,
        ConsigneeName: false,
        ConsigneeEmail: false,
        ConsigneePhone: false,
        ConsigneeFax: false,
        Notify: false,
        NotifyAccount: false,
        NotifyName: false,
        NotifyEmail: false,
        NotifyPhone: false,
        NotifyFax: false,
        POL: false,
        POD: false,
        Vessel: false,
        Voyage: false,
        Captain: false,
        DeclarationOfValue: false,
        NRT: false,
        GRT: false,
        isValid: function() {
            return true;
        },
        StartState: function() {
            this.BOLStatus = BOLObject.status;
            this.FreightTerm = BOLObject.freightTerms;
            this.CarrierBookingRef = BOLObject.carrierBookingRef;
            this.ExportRef = BOLObject.exportReference;
            this.Forwarder = BOLObject.forwarder.name;
            this.ForwarderAccount = BOLObject.forwarder.address;
            this.ForwarderName = BOLObject.forwarder.contact.name;
            this.ForwarderEmail = BOLObject.forwarder.contact.email;
            this.ForwarderPhone = BOLObject.forwarder.contact.phone;
            this.ForwarderFax = BOLObject.forwarder.contact.fax;
            this.Shipper = BOLObject.shipper.name;
            this.ShipperAccount = BOLObject.shipper.address;
            this.ShipperName = BOLObject.shipper.contact.name;
            this.ShipperEmail = BOLObject.shipper.contact.email;
            this.ShipperPhone = BOLObject.shipper.contact.phone;
            this.ShipperFax = BOLObject.shipper.contact.fax;
            this.Consignee = BOLObject.consignee.name;
            this.ConsigneeAccount = BOLObject.consignee.address;
            this.ConsigneeName = BOLObject.consignee.contact.name;
            this.ConsigneeEmail = BOLObject.consignee.contact.email;
            this.ConsigneePhone = BOLObject.consignee.contact.phone;
            this.ConsigneeFax = BOLObject.consignee.contact.fax;
            this.Notify = BOLObject.notifyParty.name;
            this.NotifyAccount = BOLObject.notifyParty.address;
            this.NotifyName = BOLObject.notifyParty.contact.name;
            this.NotifyEmail = BOLObject.notifyParty.contact.email;
            this.NotifyPhone = BOLObject.notifyParty.contact.phone;
            this.NotifyFax = BOLObject.notifyParty.contact.fax;
            this.POL = BOLObject.POL;
            this.POD = BOLObject.POD;
            this.Vessel = BOLObject.vessel;
            this.Voyage = BOLObject.voyageNum;
            this.Captain = BOLObject.captain;
            this.DeclarationOfValue = BOLObject.declarationOfValue;
            this.NRT = BOLObject.NRT;
            this.GRT = BOLObject.GRT;
        }
    };
    const CargoState = {
        Cargo: [],
        StartState: function() {
            this.Cargo = [];
            BOLObject.cargo.forEach(item => {
                this.Cargo.push(item);
            });
        },
        isValid: function() {
            return true;
        }
    };
    const RateState = {
        CargoRates: [],
        BOLRates: [],
        StartState: function() {
            this.CargoRates = [];
            this.BOLRates = [];
            BOLObject.setTotalRates();
            BOLObject.cargoRates.forEach(item => {
                this.CargoRates.push(item);
            });
            BOLObject.BOLRates.forEach(item => {
                this.BOLRates.push(item);
            });
        },
        isValid: function() {
            return true;
        }
    };
    const OptionState = {
        ShowCBM: true,
        ShowWeights: true,
        ShowFreightForwarder: true,
        Freighted: true,
        RoundWeight: 2,
        RoundCBM: 2,
        StartState: function() {
            this.ShowCBM = BOLObject.showCBM ? BOLObject.showCBM : true;
            this.ShowWeights = BOLObject.showWeights ? BOLObject.showWeights : true;
            this.ShowFreightForwarder = BOLObject.showFreightForwarder ? BOLObject.showFreightForwarder : true;
            this.Freighted = BOLObject.freighted ? BOLObject.freighted : true;
            this.RoundWeight = BOLObject.roundWeight ? BOLObject.roundWeight : 2;
            this.RoundCBM = BOLObject.roundCBM ? BOLObject.roundCBM : 2;
        }
    }
    const BOLObject = new BillOfLading(billsOflading.filter(item => {
        return item.id == BOLId;
    })[0]);

    $('#EditCommercialBOLModal').modal('show');
    showModalTabGeneral();

    
    function showModalTabGeneral() {
        GeneralState.StartState();
        //Setting the template
        $('#EditCommercialBOLBody').html($('#EditCommercialBOLGeneralTabTemplate').html());
        //Setting text on submit button to be submit or next
        $('#EditCommercialBOLBtn').html('Next');
        $('#EditCommercialBOLBtn').off('click');
        $('#EditCommercialBOLBtn').on('click', function() {
            if(GeneralState.isValid()) {
                saveGeneralTab();
                showModalTabCargo();
            }
        });
        //Change btn-secondary and btn-primary on the tabs
        $('#EditCommercialBOLGeneralTab').removeClass('btn-secondary');
        $('#EditCommercialBOLGeneralTab').addClass('btn-primary');
        $('#EditCommercialBOLGeneralTab').off('click');
        $('#EditCommercialBOLCargoTab').removeClass('btn-primary');
        $('#EditCommercialBOLCargoTab').addClass('btn-secondary');
        $('#EditCommercialBOLCargoTab').off('click');
        $('#EditCommercialBOLCargoTab').on('click', () => {
            if(GeneralState.isValid()) {
                saveGeneralTab();
                showModalTabCargo();
            }
        });
        $('#EditCommercialBOLRatesTab').removeClass('btn-primary');
        $('#EditCommercialBOLRatesTab').addClass('btn-secondary');
        $('#EditCommercialBOLRatesTab').off('click');
        $('#EditCommercialBOLRatesTab').on('click', () => {
            if(GeneralState.isValid()) {
                saveGeneralTab();
                showModalTabRates();
            }
        });
        $('#EditCommercialBOLOptionsTab').removeClass('btn-primary');
        $('#EditCommercialBOLOptionsTab').addClass('btn-secondary');
        $('#EditCommercialBOLOptionsTab').off('click');
        $('#EditCommercialBOLOptionsTab').on('click', () => {
            if(GeneralState.isValid()) {
                saveGeneralTab();
                showModalTabOptions();
            }
        });

        //Setting up BOL Status
        $('#ECBBOLStatus').html('');
        BOLStatuses.forEach(item => {
            $('#ECBBOLStatus').append(`<option value="${item.id}">${item.description}</option>`);
        });
        $('#ECBBOLStatus').off('change');
        $('#ECBBOLStatus').on('change', () => {
            GeneralState.BOLStatus = $('#ECBBOLStatus').val();
        });
        //Setting up Freight Terms
        $('#ECBGeneralFreightTerms').html('');
        freightTerms.forEach(item => {
            $('#ECBGeneralFreightTerms').append(`<option value="${item.id}">${item.freightTerm}</option>`);
        })
        $('#ECBGeneralFreightTerms').off('change');
        $('#ECBGeneralFreightTerms').on('change', () => {
            GeneralState.FreightTerm = $('#ECBGeneralFreightTerms').val();
        });
        //Carrier Booking Ref
        $('#ECBCarrierBookingRef').off('change');
        $('#ECBCarrierBookingRef').on('change', () => {
            GeneralState.CarrierBookingRef = $('#ECBCarrierBookingRef').val();
        });
        //Export Ref
        $('#ECBExportRef').off('change');
        $('#ECBExportRef').on('change', () => {
            GeneralState.ExportRef = $('#ECBExportRef').val();
        });
        //Forwarder
        $("#ECBForwarder").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#ECBForwarder').val();
                });
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#ECBForwarderError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Forwarder = $('#ECBForwarder').val();
                    populateAccountDiv(customer[0], 'Forwarder');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#ECBForwarderAccountDiv').html('');
                    $('#ECBForwarderError').text(`There are multiple customers named '${$('#ECBForwarder').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Forwarder = false;
                //If no customers are found
                } else {
                    $('#ECBForwarderAccountDiv').html('');
                    $('#ECBForwarderError').text(`'${$('#ECBForwarder').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Forwarder = false;
                }
            }
        });
        $("#ECBForwarder").autocomplete('widget').css('z-index', 2000);
        $('#ECBForwarderName').off('change');
        $('#ECBForwarderName').on('change', function() {
            GeneralState.ForwarderName = $(this).val();
        });
        $('#ECBForwarderEmail').off('change');
        $('#ECBForwarderEmail').on('change', function() {
            GeneralState.ForwarderEmail = $(this).val();
        });
        $('#ECBForwarderPhone').off('change');
        $('#ECBForwarderPhone').on('change', function() {
            GeneralState.ForwarderPhone = $(this).val();
        });
        $('#ECBForwarderFax').off('change');
        $('#ECBForwarderFax').on('change', function() {
            GeneralState.ForwarderFax = $(this).val();
        });
        //Shipper
        $("#ECBShipper").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#ECBShipper').val();
                });
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#ECBShipperError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Shipper = $('#ECBShipper').val();
                    populateAccountDiv(customer[0], 'Shipper');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#AccountDiv').html('');
                    $('#ECBShipperError').text(`There are multiple customers named '${$('#ECBShipper').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Shipper = false;
                //If no customers are found
                } else {
                    $('#AccountDiv').html('');
                    $('#ECBShipperError').text(`'${$('#ECBShipper').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Shipper = false;
                }
            }
        });
        $("#ECBShipper").autocomplete('widget').css('z-index', 2000);
        $('#ECBShipperName').off('change');
        $('#ECBShipperName').on('change', function() {
            GeneralState.ShipperName = $(this).val();
        });
        $('#ECBShipperEmail').off('change');
        $('#ECBShipperEmail').on('change', function() {
            GeneralState.ShipperEmail = $(this).val();
        });
        $('#ECBShipperPhone').off('change');
        $('#ECBShipperPhone').on('change', function() {
            GeneralState.ShipperPhone = $(this).val();
        });
        $('#ECBShipperFax').off('change');
        $('#ECBShipperFax').on('change', function() {
            GeneralState.ShipperFax = $(this).val();
        });
        //Consignee
        $("#ECBConsignee").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#ECBConsignee').val();
                })
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#ECBConsigneeError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Consignee = $('#ECBConsignee').val();
                    populateAccountDiv(customer[0], 'Consignee');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#ECBConsigneeAccountDiv').html('');
                    $('#ECBConsigneeError').text(`There are multiple customers named '${$('#ECBConsignee').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Consignee = false;
                //If no customers are found
                } else {
                    $('#ECBConsigneeAccountDiv').html('');
                    $('#ECBConsigneeError').text(`'${$('#ECBConsignee').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Consignee = false;
                }
            }
        });
        $("#ECBConsignee").autocomplete('widget').css('z-index', 2000);
        $('#ECBConsigneeName').off('change');
        $('#ECBConsigneeName').on('change', function() {
            GeneralState.ConsigneeName = $(this).val();
        });
        $('#ECBConsigneeEmail').off('change');
        $('#ECBConsigneeEmail').on('change', function() {
            GeneralState.ConsigneeEmail = $(this).val();
        });
        $('#ECBConsigneePhone').off('change');
        $('#ECBConsigneePhone').on('change', function() {
            GeneralState.ConsigneePhone = $(this).val();
        });
        $('#ECBConsigneeFax').off('change');
        $('#ECBConsigneeFax').on('change', function() {
            GeneralState.ConsigneeFax = $(this).val();
        });
        //Notify Party
        $("#ECBNotify").autocomplete({
            source: customerList,
            change: function( event, ui ) {
                //Filters through customer to see if customer name entered is valid
                let customer = customerList.filter(customer => {
                    return customer.companyName === $('#ECBNotify').val();
                })
                //If 1 customer is found
                if(customer.length === 1) {
                    $('#ECBNotifyError').text("");
                    //If Everything is valid, set the state for this section
                    GeneralState.Notify = $('#ECBNotify').val();
                    populateAccountDiv(customer[0], 'Notify');
                //If more than 1 cusotmer is found
                } else if(customer.length > 1){
                    $('#ECBNotifyAccountDiv').html('');
                    $('#ECBNotifyError').text(`There are multiple customers named '${$('#ECBNotify').val()}'. Contact the IT Department for help!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Notify = false;
                //If no customers are found
                } else {
                    $('#ECBNotifyAccountDiv').html('');
                    $('#ECBNotifyError').text(`'${$('#ECBNotify').val()}' is not a valid customer! Either type the name in correctly or Choose one from the dropdown!`);
                    //If there is an Error, set the state for this section
                    GeneralState.Notify = false;
                }
            }
        });
        $("#ECBNotify").autocomplete('widget').css('z-index', 2000);
        $('#ECBNotifyName').off('change');
        $('#ECBNotifyName').on('change', function() {
            GeneralState.NotifyName = $(this).val();
        });
        $('#ECBNotifyEmail').off('change');
        $('#ECBNotifyEmail').on('change', function() {
            GeneralState.NotifyEmail = $(this).val();
        });
        $('#ECBNotifyPhone').off('change');
        $('#ECBNotifyPhone').on('change', function() {
            GeneralState.NotifyPhone = $(this).val();
        });
        $('#ECBNotifyFax').off('change');
        $('#ECBNotifyFax').on('change', function() {
            GeneralState.NotifyFax = $(this).val();
        });
        //POL
        $("#ECBPOL").autocomplete({
            source: ports,
            change: function( event, ui ) {
                //Filters through ports to see if port name entered is valid
                let port = ports.filter(port => {
                    return port.Name === $('#ECBPOL').val();
                });
                //If 1 port is found
                if(port.length === 1) {
                    $('#ECBPOLError').text("");
                    GeneralState.POL = new Port3(port[0]);
                    $('#ECBPOL').val(GeneralState.POL.Name);
                    if($('#ECBPOL').val() == $('#ECBPOD').val()) {
                        $('.POLPODSameError').text('POL and POD can not be the same!');
                    } else {
                        $('.POLPODSameError').text('');
                    }
                //If more than 1 port is found
                } else if(port.length > 1){
                    $('#ECBPOLError').text(`There are multiple ports named '${$('#ECBPOL').val()}'. Contact the IT Department for help!`);
                    GeneralState.POL = false;
                //If no ports are found
                } else {
                    $('#ECBPOLError').text(`'${$('#ECBPOL').val()}' is not a valid port! Either type the name in correctly or Choose one from the dropdown!`);
                    GeneralState.POL = false;
                }
            }
        });
        $("#ECBPOL").autocomplete('widget').css('z-index', 2000);
        //POD
        $("#ECBPOD").autocomplete({
            source: ports,
            change: function( event, ui ) {
                //Filters through ports to see if port name entered is valid
                let port = ports.filter(port => {
                    return port.Name === $('#ECBPOD').val();
                });
                //If 1 port is found
                if(port.length === 1) {
                    $('#ECBPODError').text("");
                    GeneralState.POD = new Port3(port[0]);
                    $('#ECBPOD').val(GeneralState.POD.Name);
                    if($('#ECBPOL').val() == $('#ECBPOD').val()) {
                        $('.POLPODSameError').text('POL and POD can not be the same!');
                    } else {
                        $('.POLPODSameError').text('');
                    }
                //If more than 1 port is found
                } else if(port.length > 1){
                    $('#ECBPODError').text(`There are multiple ports named '${$('#ECBPOD').val()}'. Contact the IT Department for help!`);
                    GeneralState.POL = false;
                //If no ports are found
                } else {
                    $('#ECBPODError').text(`'${$('#ECBPOD').val()}' is not a valid port! Either type the name in correctly or Choose one from the dropdown!`);
                    GeneralState.POL = false;
                }
            }
        });
        $("#ECBPOD").autocomplete('widget').css('z-index', 2000);
        //Vessel
        $("#ECBVessel").autocomplete({
            source: vessels,
            change: function( event, ui ) {
                //Filters through vessels to see if vessel name entered is valid
                let vessel = vessels.filter(vessel => {
                    return vessel.Name === $('#ECBVessel').val();
                })
                //If 1 vessel is found
                if(vessel.length === 1) {
                    $('#ECBVesselError').text("");
                    GeneralState.Vessel = new Vessel3(vessel[0]);
                    $('#ECBVessel').val(GeneralState.Vessel.Name);
                //If more than 1 vessel is found
                } else if(vessel.length > 1){
                    $('#ECBVesselError').text(`There are multiple vessels named '${$('#ECBVessel').val()}'. Contact the IT Department for help!`);
                    GeneralState.Vessel = false;
                //If no vessels are found
                } else {
                    $('#ECBVesselError').text(`'${$('#ECBVessel').val()}' is not a valid vessel! Either type the name in correctly or Choose one from the dropdown!`);
                    GeneralState.Vessel = false;
                }
            }
        });
        $("#ECBVessel").autocomplete('widget').css('z-index', 2000); 
        //Voyage
        $('#ECBVoyage').off('change');
        $('#ECBVoyage').on('change', () => {
            if(parseInt($('#ECBVoyage')) < 0) {
                $('#ECBVoyageError').text('Voyage Number can not be below 0!');
                GeneralState.Voyage = false;
            } else {
                $('#ECBVoyageError').text('');
                GeneralState.Voyage = $('#ECBVoyage').val();
            }
        });
        //Captain
        $('#ECBCaptain').off('change');
        $('#ECBCaptain').on('change', () => {
            GeneralState.Captain = $('#ECBCaptain').val();
        });
        //Declaration Of Value
        $('#ECBDeclarationOfValue').off('change');
        $('#ECBDeclarationOfValue').on('change', () => {
            GeneralState.DeclarationOfValue = $('#ECBDeclarationOfValue').val();
        }); 
        //NRT
        $('#ECBNRT').off('change');
        $('#ECBNRT').on('change', () => {
            GeneralState.NRT = $('#ECBNRT').val();
        });
        //GRT
        $('#ECBGRT').off('change');
        $('#ECBGRT').on('change', () => {
            GeneralState.GRT = $('#ECBGRT').val();
        });
        accountOnClick();
        loadGeneralTab();


        function loadGeneralTab() {
            $('#ECBBOLStatus').val(GeneralState.BOLStatus);
            $('#ECBBOLStatus').change();
            $('#ECBGeneralFreightTerms').val(GeneralState.FreightTerm);
            $('#ECBGeneralFreightTerms').change();
            $('#ECBCarrierBookingRef').val(GeneralState.CarrierBookingRef);
            $('#ECBCarrierBookingRef').change();
            $('#ECBExportRef').val(GeneralState.ExportRef);
            $('#ECBExportRef').change();
            //Forwarder
            $('#ECBForwarder').val(GeneralState.Forwarder);
            let customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Forwarder;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Forwarder'); 
                $(`input[accountType="Forwarder"][value="${GeneralState.ForwarderAccount.accountId}"]`).attr('checked', true);
            }
            $('#ECBForwarderName').val(GeneralState.ForwarderName);
            $('#ECBForwarderEmail').val(GeneralState.ForwarderEmail);
            $('#ECBForwarderPhone').val(GeneralState.ForwarderPhone);
            $('#ECBForwarderFax').val(GeneralState.ForwarderFax);
            //Shipper
            $('#ECBShipper').val(GeneralState.Shipper);
            customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Shipper;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Shipper'); 
                $(`input[accountType="Shipper"][value="${GeneralState.ShipperAccount.accountId}"]`).attr('checked', true);
            }
            $('#ECBShipperName').val(GeneralState.ShipperName);
            $('#ECBShipperEmail').val(GeneralState.ShipperEmail);
            $('#ECBShipperPhone').val(GeneralState.ShipperPhone);
            $('#ECBShipperFax').val(GeneralState.ShipperFax);
            //Consignee
            $('#ECBConsignee').val(GeneralState.Consignee);
            customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Consignee;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Consignee'); 
                $(`input[accountType="Consignee"][value="${GeneralState.ConsigneeAccount.accountId}"]`).attr('checked', true);
            }
            $('#ECBConsigneeName').val(GeneralState.ConsigneeName);
            $('#ECBConsigneeEmail').val(GeneralState.ConsigneeEmail);
            $('#ECBConsigneePhone').val(GeneralState.ConsigneePhone);
            $('#ECBConsigneeFax').val(GeneralState.ConsigneeFax);
            //Notify Party
            $('#ECBNotify').val(GeneralState.Notify);
            customer = customerList.filter(customer => {
                return customer.companyName === GeneralState.Notify;
            });
            if(customer.length > 0) { 
                populateAccountDiv(customer[0], 'Notify'); 
                $(`input[accountType="Notify"][value="${GeneralState.NotifyAccount.accountId}"]`).attr('checked', true);
            }
            $('#ECBNotifyName').val(GeneralState.NotifyName);
            $('#ECBNotifyEmail').val(GeneralState.NotifyEmail);
            $('#ECBNotifyPhone').val(GeneralState.NotifyPhone);
            $('#ECBNotifyFax').val(GeneralState.NotifyFax);
            $('#ECBPOL').val(GeneralState.POL.Name);
            $('#ECBPOL').change();
            $('#ECBPOD').val(GeneralState.POL.Name);
            $('#ECBPOD').change();
            $('#ECBVessel').val(GeneralState.Vessel.Name);
            $('#ECBVessel').change(); 
            $('#ECBVoyage').val(GeneralState.Voyage);
            $('#ECBVoyage').change(); 
            $('#ECBCaptain').val(GeneralState.Captain);
            $('#ECBCaptain').change(); 
            $('#ECBDeclarationOfValue').val(GeneralState.DeclarationOfValue);
            $('#ECBDeclarationOfValue').change();
            $('#ECBNRT').val(GeneralState.NRT);
            $('#ECBNRT').change(); 
            $('#ECBGRT').val(GeneralState.GRT);
            $('#ECBGRT').change();
        }
        //Helper Functions
        //Helper Function for loading the addresses once the customer has been selected
        function populateAccountDiv(customer, account){
            $(`#ECB${account}AccountDiv`).html('');
            for (var i = 0; i < customer.accountList.length; i++) {
                $(`#ECB${account}AccountDiv`).append(
                    `<div class="form-check mt-1 mb-1">
                        <input id="${account}AccountRadios${customer.accountList[i].accountID}" class="form-check-input AccountRadios" type="radio" value="${customer.accountList[i].accountID}" accountType="${account}" name="${account}AccountRadios" customer="${customer.customerID}">
                        <label class="form-check-label" for="${account}AccountRadios${customer.accountList[i].accountID}">
                            ${getAddressFromAccount(customer.accountList[i])}
                        </label>
                    </div>`
                );
            }
            accountOnClick();
            //Helper Function for populateAccountDiv()
            //Creates the Address String with Account Name(If applicable) and returns it
            function getAddressFromAccount(account) {
                return `${account.accountName ? account.accountName + ": <br><p class='pl-3 mb-0' style='font-size:85%'>" : "<p class='mb-0'>"}
                        ${account.address1}, ${account.city} ${account.state} ${account.zip}, 
                        ${account.country}${account.accountName ? '</p>' : "</p>"}`;
            }
        }
        function accountOnClick() {
            $('.AccountRadios').off('click');
            $('.AccountRadios').on('click', function() {
                const tmpCustomer = customerList.filter(item => {
                    return item.customerID == $(this).attr('customer');
                })[0];
                const tmpAccount = tmpCustomer.accountList.filter(item => {
                    return item.accountID == $(this).attr('value');
                })[0];
                const tmpAddress = new Account3({
                    accountId: tmpAccount.accountID ? tmpAccount.accountID : null,
                    accountName: tmpAccount.accountName ? tmpAccount.accountName : null,
                    address1: tmpAccount.address1 ? tmpAccount.address1 : null,
                    address2: tmpAccount.address2 ? tmpAccount.address2 : null,
                    addressId: tmpAccount.addressID ? tmpAccount.addressID : null,
                    addressTypeId: tmpAccount.addressTypeID ? tmpAccount.addressTypeID : null,
                    city: tmpAccount.city ? tmpAccount.city : null,
                    country: tmpAccount.country ? tmpAccount.country : null,
                    state: tmpAccount.state ? tmpAccount.state : null,
                    zip: tmpAccount.zip ? tmpAccount.zip : null
                });
                switch($(this).attr('accountType')) {
                    case 'Forwarder':
                        GeneralState.ForwarderAccount = tmpAddress;
                        break;
                    case 'Shipper':
                        GeneralState.ShipperAccount = tmpAddress;
                        break;
                    case 'Consignee':
                        GeneralState.ConsigneeAccount = tmpAddress;
                        break;
                    case 'Notify':
                        GeneralState.NotifyAccount = tmpAddress;
                        break;
                }
            });
        }
    }
    function saveGeneralTab() {
        BOLObject.status = GeneralState.BOLStatus;
        BOLObject.freightTerms = GeneralState.FreightTerm;
        BOLObject.carrierBookingRef = GeneralState.CarrierBookingRef;
        BOLObject.exportReference = GeneralState.ExportRef;
        BOLObject.forwarder.name = GeneralState.Forwarder;
        BOLObject.forwarder.address = GeneralState.ForwarderAccount;
        BOLObject.forwarder.contact.name = GeneralState.ForwarderName;
        BOLObject.forwarder.contact.email = GeneralState.ForwarderEmail;
        BOLObject.forwarder.contact.phone  = GeneralState.ForwarderPhone;
        BOLObject.forwarder.contact.fax = GeneralState.ForwarderFax;
        BOLObject.consignee.name = GeneralState.Consignee;
        BOLObject.consignee.address = GeneralState.ConsigneeAccount;
        BOLObject.consignee.contact.name = GeneralState.ConsigneeName;
        BOLObject.consignee.contact.email = GeneralState.ConsigneeEmail;
        BOLObject.consignee.contact.phone = GeneralState.ConsigneePhone;
        BOLObject.consignee.contact.fax = GeneralState.ConsigneeFax;
        BOLObject.notifyParty.name = GeneralState.Notify;
        BOLObject.notifyParty.address = GeneralState.NotifyAccount;
        BOLObject.notifyParty.contact.name = GeneralState.NotifyName;
        BOLObject.notifyParty.contact.email = GeneralState.NotifyEmail;
        BOLObject.notifyParty.contact.phone = GeneralState.NotifyPhone;
        BOLObject.notifyParty.contact.fax = GeneralState.NotifyFax;
        BOLObject.shipper.name = GeneralState.Shipper;
        BOLObject.shipper.address = GeneralState.ShipperAccount;
        BOLObject.shipper.contact.name = GeneralState.ShipperName;
        BOLObject.shipper.contact.email = GeneralState.ShipperEmail;
        BOLObject.shipper.contact.phone = GeneralState.ShipperPhone;
        BOLObject.shipper.contact.fax = GeneralState.ShipperFax;
        BOLObject.POL = GeneralState.POL;
        BOLObject.POD = GeneralState.POD;
        BOLObject.vessel = GeneralState.Vessel;
        BOLObject.voyageNum = GeneralState.Voyage;
        BOLObject.captain = GeneralState.Captain;
        BOLObject.declarationOfValue = GeneralState.DeclarationOfValue;
        BOLObject.NRT = GeneralState.NRT;
        BOLObject.GRT = GeneralState.GRT;
    }
    function showModalTabCargo() {
        CargoState.StartState();
        //Setting the template
        $('#EditCommercialBOLBody').html($('#EditCommercialBOLCargoTabTemplate').html());
        //Change btn-secondary and btn-primary on the tabs
        $('#EditCommercialBOLGeneralTab').removeClass('btn-primary');
        $('#EditCommercialBOLGeneralTab').addClass('btn-secondary');
        $('#EditCommercialBOLGeneralTab').off('click');
        $('#EditCommercialBOLGeneralTab').on('click', () => {
            saveCargoTab();
            showModalTabGeneral();
        });
        $('#EditCommercialBOLCargoTab').removeClass('btn-secondary');
        $('#EditCommercialBOLCargoTab').addClass('btn-primary');
        $('#EditCommercialBOLCargoTab').off('click');
        $('#EditCommercialBOLRatesTab').removeClass('btn-primary');
        $('#EditCommercialBOLRatesTab').addClass('btn-secondary');
        $('#EditCommercialBOLRatesTab').off('click');
        $('#EditCommercialBOLRatesTab').on('click', () => {
            saveCargoTab();
            showModalTabRates();
        });
        $('#EditCommercialBOLOptionsTab').removeClass('btn-primary');
        $('#EditCommercialBOLOptionsTab').addClass('btn-secondary');
        $('#EditCommercialBOLOptionsTab').off('click');
        $('#EditCommercialBOLOptionsTab').on('click', () => {
            saveCargoTab();
            showModalTabOptions();
        });

        //Setting text on submit button to be submit or next
        $('#EditCommercialBOLBtn').html('Next');
        $('#EditCommercialBOLBtn').off('click');
        $('#EditCommercialBOLBtn').on('click', () => {
            saveCargoTab();
            showModalTabRates();
        });
        //Add Cargo Button
        $('#ECBAddCargoBtn').off('click');
        $('#ECBAddCargoBtn').on('click', () => {
            openAddCargoModal();
        });
        drawTable();

        function openAddCargoModal() {
            $('#CommercialMastersAddCargoModal').modal('show');
            //Fading in/out the original modal
            $('#CommercialMastersAddCargoModal').on('hidden.bs.modal', function () {
                $('#CommercialMastersModal').attr('style', '9999; display: block;');
            })
            $('#CommercialMastersModal').attr('style', 'z-index: 999; display: block;');

            //Filtering the available cargo to select
            const filteredCargo = commercialCargo.filter(item => {
                if(item.bookingNumber == BOLObject.carrierBookingRef
                && item.POL.port.id == BOLObject.POL.id
                && item.POD.port.id == BOLObject.POD.id) {
                    let tmp = true;
                    for(let i = 0; i < CargoState.Cargo.length; i++) {
                        if(CargoState.Cargo[i].id == item.id) {
                            tmp = false;
                        }
                    }
                    if(tmp){
                        return item;
                    }
                }
            });

            const AddCargoTable = $('#ECBAddCargoTable').DataTable({
                destroy: true,
                paging: false,
                searching: false,
                scrollX: true,
                scrollY: '40vh',
                select: {
                    style: 'multi',   
                },
                data: filteredCargo,
                columns: [
                    //VIN
                    {
                        data: 'VIN',
                        render: function(data) {
                            return data;
                        }
                    },
                    //Booking Number
                    {
                        data: 'bookingNumber',
                        render: function(data) {
                            return data;
                        }
                    },
                    //CargoStatus
                    {
                        data: 'cargoStatus',
                        render: function(data) {
                            return readReferenceTables(cargoStatuses, data).description;
                        }
                    },
                    //Description
                    {
                        data: 'cargoDescription',
                        render: function(data) {
                            return data;
                        }
                    },
                    //Forwarder
                    {
                        data: 'forwarder',
                        render: function(data) {
                            return data ? data.name : 'N/A';
                        }
                    }
                ]
            });

            $('#ECBSubmitAddCargoBtn').off('click');
            $('#ECBSubmitAddCargoBtn').on('click', () => {
                for(let i = 0; i < AddCargoTable.rows('.selected').data().length; i++) {
                    let tmp = CargoState.Cargo.findIndex(item => {
                        return item.id == AddCargoTable.rows('.selected').data()[i].id;
                    });
                    if(tmp == -1) {
                        switch(AddCargoTable.rows('.selected').data()[i].customerType) {
                            case 'M':
                                CargoState.Cargo.push(new MilitaryCargo3(AddCargoTable.rows('.selected').data()[i]));
                                break;
                            case 'C':
                                CargoState.Cargo.push(new CommercialCargo3(AddCargoTable.rows('.selected').data()[i]));
                                break;
                        }
                    }
                }
                $('#CommercialMastersAddCargoModal').modal('hide');
                drawTable();
            });
        }
        //Draws the table as well as onclicks for removing cargo
        function drawTable() {
            //Setting up the Cargo Table
            $('#ECBCargoTable').DataTable({
                destroy: true,
                paging: false,
                searching: false,
                scrollX: true,
                scrollY: '40vh',
                data: CargoState.Cargo,
                columns: [
                    //Remove
                    {
                        data: 'id',
                        className: 'align-middle',
                        render: function(data) {
                            return `<button class="CMCargoTableRemoveCargoBtn float-right btn btn-sm btn-outline-danger" cargoId="${data}"><i class="fas fa-times"></i></button>`;
                        }
                    },
                    //VIN
                    {
                        data: 'VIN',
                        render: function(data) {
                            return data;
                        }
                    },
                    //Description
                    {
                        data: 'cargoDescription',
                        render: function(data) {
                            return `<input cargoId="${data.id}" value="${data ? data : ''}" size="17">`;
                        }
                    },
                    //Length
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.lengths.m).toFixed(3);
                        }
                    },
                    //Width
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.widths.m).toFixed(3);
                        }
                    },
                    //Height
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.heights.m).toFixed(3);
                        }
                    },
                    //Weight
                    {
                        data: 'dims',
                        render: function(data) {
                            return parseFloat(data.weights.mt).toFixed(3);
                        }
                    },
                    //AES ITN
                    {
                        data: function(row, type, val, meta) {
                            return row;
                        },
                        className: 'align-middle',
                        render: function(data) {
                            return `<input class="CMCargoTableAESITN" cargoId="${data.id}" value="${data.AESITN ? data.AESITN : ''}" size="10">`;
                        }
                    },
                    //HSCODE
                    {
                        data: function(row, type, val, meta) {
                            return row;
                        },
                        className: 'align-middle',
                        render: function(data) {
                            return `<input class="CMCargoTableHSCode" cargoId="${data.id}" value="${data.HSCode ? data.HSCode : ''}" size="10">`;
                        }
                    },
                    //Position
                    {
                        data: function(row, type, val, meta) {
                            return meta;
                        },
                        render: function(data) {
                            return `<button class="btn CMCargoPositionBtn" index="${data.row}" dir="up" ${data.row == 0 ? 'disabled' : ''}><i class="fas fa-angle-up"></i></button> <button class="btn CMCargoPositionBtn" index="${data.row}" dir="down" ${data.row == CargoState.Cargo.length - 1 ? 'disabled' : ''}><i class="fas fa-angle-down"></i></button>`;
                        }
                    }
                ]
            });
            //Set the on clicks and on changes and all that good stuff
            $('.ECBCargoTableRemoveCargoBtn').off('click');
            $('.ECBCargoTableRemoveCargoBtn').on('click', function() {
                let tmp = CargoState.Cargo.findIndex(item => {
                    return item.id == $(this).attr('cargoId');
                });
                if(tmp !== -1) {
                    CargoState.Cargo.splice(tmp, 1);
                }
                drawTable();
            });
            $('.ECBCargoTableAESITN').off('change');
            $('.ECBCargoTableAESITN').on('change', function() {
                let tmp = CargoState.Cargo.findIndex(item => {
                    return item.id == $(this).attr('cargoId');
                });
                if(tmp !== -1) {
                    CargoState.Cargo[tmp].AESITN = $(this).val();
                }
            });
            $('.ECBCargoTableHSCode').off('change');
            $('.ECBCargoTableHSCode').on('change', function() {
                let tmp = CargoState.Cargo.findIndex(item => {
                    return item.id == $(this).attr('cargoId');
                });
                if(tmp !== -1) {
                    CargoState.Cargo[tmp].HSCode = $(this).val();
                }
            });
            $('.ECBCargoPositionBtn').off('click');
            $('.ECBCargoPositionBtn').on('click', function() {
                let index = parseInt($(this).attr('index'));
                let tmpCargo = CargoState.Cargo[index];
                switch($(this).attr('dir')) {
                    case 'up':
                        CargoState.Cargo[index] = CargoState.Cargo[index - 1];
                        CargoState.Cargo[index - 1] = tmpCargo;
                        break;
                    case 'down':
                        CargoState.Cargo[index] = CargoState.Cargo[index + 1];
                        CargoState.Cargo[index + 1] = tmpCargo;
                        break;
                };
                console.log(CargoState);
                drawTable();
            })
        }
    }
    function saveCargoTab() {
        if(CargoState.isValid) {
            BOLObject.cargo = [];
            CargoState.Cargo.forEach(item => {
                BOLObject.cargo.push(item);
            });
        }
    }
    function showModalTabRates() {
        //Setting the template
        $('#EditCommercialBOLBody').html($('#EditCommercialBOLRatesTabTemplate').html());
        //Change btn-secondary and btn-primary on the tabs
        $('#EditCommercialBOLGeneralTab').removeClass('btn-primary');
        $('#EditCommercialBOLGeneralTab').addClass('btn-secondary');
        $('#EditCommercialBOLGeneralTab').off('click');
        $('#EditCommercialBOLGeneralTab').on('click', () => {
            showModalTabGeneral();
        });
        $('#EditCommercialBOLCargoTab').removeClass('btn-primary');
        $('#EditCommercialBOLCargoTab').addClass('btn-secondary');
        $('#EditCommercialBOLCargoTab').off('click');
        $('#EditCommercialBOLCargoTab').on('click', () => {
            showModalTabCargo();
        });
        $('#EditCommercialBOLRatesTab').removeClass('btn-secondary');
        $('#EditCommercialBOLRatesTab').addClass('btn-primary');
        $('#EditCommercialBOLRatesTab').off('click');
        $('#EditCommercialBOLRatesTab').on('click', () => {
            showModalTabRates();
        });
        $('#EditCommercialBOLOptionsTab').removeClass('btn-primary');
        $('#EditCommercialBOLOptionsTab').addClass('btn-secondary');
        $('#EditCommercialBOLOptionsTab').off('click');
        $('#EditCommercialBOLOptionsTab').on('click', () => {
            showModalTabOptions();
        });

        $('#ECBAddRatesBtn').off('click');
        $('#ECBAddRatesBtn').on('click', function() {
            openAddRatesModal();
        });

        //Setting text on submit button to be submit or next
        $('#EditCommercialBOLBtn').html('Next');
        $('#EditCommercialBOLBtn').off('click');
        $('#EditCommercialBOLBtn').on('click', () => {
            showModalTabOptions();
        });

        RateState.StartState();

        $('#ECBRatesTable').DataTable({
            destroy: true,
            data: RateState.CargoRates.concat(RateState.BOLRates),
            columns: [
                //Actions
                {
                    data: 'rateType',
                    render: function(data) {
                        return `
                        <button class="btn btn-sm">
                            <i class="fas fa-edit" title="Edit"></i>
                        </button>`
                    }
                },
                //Service
                {
                    data: 'rateType',
                    render: function(data) {
                        let tmp = rateFeeTypes.filter(item => {
                            return item.RateTypeId == data;
                        })[0];
                        return tmp.RateType;
                    }
                },
                //Rate Type
                {
                    data: 'unitType',
                    render: function(data) {
                        let tmp = rateFeeTypes.filter(item => {
                            return item.FeeTypeId == data;
                        })[0];
                        return tmp.FeeType;
                    }
                },
                //Rate
                {
                    data: 'rate',
                    render: function(data) {
                        return data;
                    }
                },
                //Quantity
                {
                    data: 'unitTypeAmount',
                    render: function(data) {
                        return data;
                    }
                },
                //Total
                {
                    data: 'cost',
                    render: function(data) {
                        return data;
                    }
                }
            ]
        });

        function openAddRatesModal() {
            $('#CommercialMastersAddRatesModal').modal('show');
            //Fading in/out the original modal
            $('#CommercialMastersAddRatesModal').on('hidden.bs.modal', function () {
                $('#CommercialMastersModal').attr('style', '9999; display: block;');
            })
            $('#CommercialMastersModal').attr('style', 'z-index: 999; display: block;');
            
            $('#ECBAddRate').appent('<option>Test options</option>');
        }
    }
    function showModalTabOptions() {
        OptionState.StartState();
        //Setting the template
        $('#EditCommercialBOLBody').html($('#EditCommercialBOLOptionsTabTemplate').html());
        //Change btn-secondary and btn-primary on the tabs
        $('#EditCommercialBOLGeneralTab').removeClass('btn-primary');
        $('#EditCommercialBOLGeneralTab').addClass('btn-secondary');
        $('#EditCommercialBOLGeneralTab').off('click');
        $('#EditCommercialBOLGeneralTab').on('click', () => {
            showModalTabGeneral();
        });
        $('#EditCommercialBOLCargoTab').removeClass('btn-primary');
        $('#EditCommercialBOLCargoTab').addClass('btn-secondary');
        $('#EditCommercialBOLCargoTab').off('click');
        $('#EditCommercialBOLCargoTab').on('click', () => {
            showModalTabCargo();
        });
        $('#EditCommercialBOLRatesTab').removeClass('btn-primary');
        $('#EditCommercialBOLRatesTab').addClass('btn-secondary');
        $('#EditCommercialBOLRatesTab').off('click');
        $('#EditCommercialBOLRatesTab').on('click', () => {
            showModalTabRates();
        });
        $('#EditCommercialBOLOptionsTab').removeClass('btn-secondary');
        $('#EditCommercialBOLOptionsTab').addClass('btn-primary');
        $('#EditCommercialBOLOptionsTab').off('click');
        $('#EditCommercialBOLOptionsTab').on('click', () => {
            showModalTabOptions();
        });

        $('#ECBShowCBM').off('change');
        $('#ECBShowCBM').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.ShowCBM = true;
            } else {
                OptionState.ShowCBM = false;
            }
        });
        $('#ECBShowWeights').off('change');
        $('#ECBShowWeights').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.ShowWeights = true;
            } else {
                OptionState.ShowWeights = false;
            }
        });
        $('#ECBShowFreightForwarder').off('change');
        $('#ECBShowFreightForwarder').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.ShowFreightForwarder = true;
            } else {
                OptionState.ShowFreightForwarder = false;
            }
        });
        $('#ECBFreighted').off('change');
        $('#ECBFreighted').on('change', function() {
            if($(this).prop('checked')) {
                OptionState.Freighted = true;
            } else {
                OptionState.Freighted = false;
            }
        });
        $('#ECBRoundWeight').off('change');
        $('#ECBRoundWeight').on('change', function() {
            OptionState.RoundWeight = $(this).val();
        });
        $('#ECBRoundCBM').off('change');
        $('#ECBRoundCBM').on('change', function() {
            OptionState.RoundCBM = $(this).val();
        });

        //Setting text on submit button to be submit or next
        $('#EditCommercialBOLBtn').html('Submit');
        $('#EditCommercialBOLBtn').off('click');
        $('#EditCommercialBOLBtn').on('click', () => {
            saveOptionsTab();
            editBOLTransaction();
        });

        loadOptionsTab();

        function loadOptionsTab() {
            console.log(OptionState);
            if(OptionState.ShowCBM) {
                $('#ECBShowCBM').prop('checked', true);
            } else {
                $('#ECBShowCBM').prop('checked', false);
            }
            if(OptionState.ShowWeights) {
                $('#ECBShowWeights').prop('checked', true);
            } else {
                $('#ECBShowWeights').prop('checked', false);
            }
            if(OptionState.ShowFreightForwarder) {
                $('#ECBShowFreightForwarder').prop('checked', true);
            } else {
                $('#ECBShowFreightForwarder').prop('checked', false);
            }
            if(OptionState.Freighted) {
                $('#ECBFreighted').prop('checked', true);
            } else {
                $('#ECBFreighted').prop('checked', false);
            }
            $('#ECBRoundWeight').val(OptionState.RoundWeight);
            $('#ECBRoundCBM').val(OptionState.RoundCBM);
        }
    }
    function saveOptionsTab() {
        BOLObject.showCBM = OptionState.ShowCBM ? OptionState.ShowCBM : false;
        BOLObject.showWeights = OptionState.ShowWeights ? OptionState.ShowWeights : false;
        BOLObject.showFreightForwarder = OptionState.ShowFreightForwarder ? OptionState.ShowFreightForwarder : false;
        BOLObject.freighted = OptionState.Freighted ? OptionState.Freighted : false;
        BOLObject.roundWeight = OptionState.RoundWeight ? OptionState.RoundWeight : 2;
        BOLObject.roundCBM = OptionState.RoundCBM ? OptionState.RoundCBM : 2;
    }
    function editBOLTransaction() {
        console.log(BOLObject);
        let jsonDoc = {
            jsondoc: JSON.stringify(BOLObject),
            transactionType: 'BOL EDIT',
            username: 'qatester'
        }
        console.log(jsonDoc);

        $.ajax({
            url: api.updateBOLTransaction.url,
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(jsonDoc),
            headers: api.updateBOLTransaction.key,
            processData: false,
            success: function( data, textStatus, xhr ){
                console.log(data);
                $('#EditCommercialBOLModal').modal('hide');
            },
            error: function(xhr, textStatus, errorThrown ){
                console.log( {errorThrown} );
                alert("Error inserting booking transaction account: " + textStatus + " : " + errorThrown);
            },
            complete: function(){
                //Disabling the Insert Booking Spinner
                // $('#createBookingSpinner').css('display','none');
                // $('#createBookingButton').removeAttr('disabled');
                readCargo();
                readBillsOfLading();
            }
        });
    }
}

function readCargo() {
            commercialCargo.length = 0;
            let tmp = [
                {
                    "CargoJson": "{\"id\":1,\"customerType\":\"C\",\"cargoStatus\":6,\"billingStatus\":null,\"bundleIndex\":0,\"bookingId\":1,\"bookingNumber\":\"LGL202008051001\",\"BOLId\":null,\"BOLNumber\":null,\"forwarder\":{\"address\":{\"accountId\":35,\"accountName\":null,\"address1\":\"456 Fake st\",\"address2\":null,\"addressId\":34,\"addressType\":null,\"addressTypeId\":2,\"city\":\"Fake\",\"country\":\"FAKE\",\"state\":\"FK\",\"zip\":\"11234\"},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":\"Deakins Logistics Group (DLG)\"},\"consignee\":{\"address\":{\"accountId\":null,\"accountName\":null,\"address1\":null,\"address2\":null,\"addressId\":null,\"addressType\":null,\"addressTypeId\":null,\"city\":null,\"country\":null,\"state\":null,\"zip\":null},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":null},\"shipper\":{\"address\":{\"accountId\":null,\"accountName\":null,\"address1\":null,\"address2\":null,\"addressId\":null,\"addressType\":null,\"addressTypeId\":null,\"city\":null,\"country\":null,\"state\":null,\"zip\":null},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":null},\"recDate\":null,\"AESITN\":null,\"HSCode\":null,\"customAppr\":null,\"custOut\":null,\"referenceNo\":null,\"POL\":{\"port\":{\"id\":53,\"CensusCode\":\"33703\",\"CountryCode\":\"CL\",\"MilitaryCode\":\"EE1\",\"Name\":\"Antofagasta, Chile\",\"PortCode\":\"ANF\",\"ShortName\":\"ANTOFAGASTA CHILE\",\"UNCode\":\"CLANF\"},\"vessel\":{\"id\":174,\"Code\":\"GE\",\"IMONumber\":\"9674177\",\"Name\":\"Glovis Supreme\"},\"voyageNum\":\"24\",\"ETA\":null,\"actualArrival\":null,\"departingVessel\":{\"id\":null,\"Code\":null,\"IMONumber\":null,\"Name\":null},\"departingVoyageNum\":null,\"ETD\":\"2020-08-12T04:00:00.000Z\",\"actualDeparture\":null},\"POD\":{\"port\":{\"id\":1071,\"CensusCode\":\"72337\",\"CountryCode\":\"TN\",\"MilitaryCode\":\"KD6\",\"Name\":\"Sfax, Tunisia\",\"PortCode\":\"SFA\",\"ShortName\":\"SFAX TUNISA\",\"UNCode\":\"TNSFA\"},\"vessel\":{\"id\":174,\"Code\":\"GE\",\"IMONumber\":\"9674177\",\"Name\":\"Glovis Supreme\"},\"voyageNum\":\"24\",\"ETA\":\"2020-08-19T04:00:00.000Z\",\"actualArrival\":null,\"departingVessel\":{\"id\":null,\"Code\":null,\"IMONumber\":null,\"Name\":null},\"departingVoyageNum\":null,\"ETD\":null,\"actualDeparture\":null},\"transshipments\":[],\"rates\":[],\"totalCost\":null,\"cargoDescription\":\"BOL FAKE BIG CARGO 1\",\"year\":null,\"make\":null,\"model\":null,\"color\":null,\"numAxles\":4,\"dims\":{\"unitOfMeasure\":3,\"length\":150,\"lengths\":{\"inch\":5905.511811023623,\"ft\":492.12598425196853,\"m\":150},\"width\":10,\"widths\":{\"inch\":393.7007874015748,\"ft\":32.808398950131235,\"m\":10},\"height\":20,\"heights\":{\"inch\":787.4015748031496,\"ft\":65.61679790026247,\"m\":20},\"volumes\":{\"inch\":1830712322.8419685,\"ft\":1059440.001644658,\"m\":30000},\"areas\":{\"inch\":2325004.6500093,\"ft\":16145.865625064585,\"m\":1500},\"weightUnit\":2,\"weight\":5000,\"weights\":{\"lb\":11023.10769984486,\"kg\":5000,\"mt\":5}},\"cargoType\":\"3\",\"cargoSubType\":7,\"cargoCondition\":1,\"mafi\":false,\"hazmat\":false,\"comments\":null,\"internalComments\":null,\"isVoid\":false,\"isDelete\":false,\"VIN\":\"FAKEVIN1\"}"
                },
                {
                    "CargoJson": "{\"id\":2,\"customerType\":\"C\",\"cargoStatus\":6,\"billingStatus\":null,\"bundleIndex\":1,\"bookingId\":1,\"bookingNumber\":\"LGL202008051001\",\"BOLId\":null,\"BOLNumber\":null,\"forwarder\":{\"address\":{\"accountId\":35,\"accountName\":null,\"address1\":\"456 Fake st\",\"address2\":null,\"addressId\":34,\"addressType\":null,\"addressTypeId\":2,\"city\":\"Fake\",\"country\":\"FAKE\",\"state\":\"FK\",\"zip\":\"11234\"},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":\"Deakins Logistics Group (DLG)\"},\"consignee\":{\"address\":{\"accountId\":null,\"accountName\":null,\"address1\":null,\"address2\":null,\"addressId\":null,\"addressType\":null,\"addressTypeId\":null,\"city\":null,\"country\":null,\"state\":null,\"zip\":null},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":null},\"shipper\":{\"address\":{\"accountId\":null,\"accountName\":null,\"address1\":null,\"address2\":null,\"addressId\":null,\"addressType\":null,\"addressTypeId\":null,\"city\":null,\"country\":null,\"state\":null,\"zip\":null},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":null},\"recDate\":null,\"AESITN\":null,\"HSCode\":null,\"customAppr\":null,\"custOut\":null,\"referenceNo\":null,\"POL\":{\"port\":{\"id\":53,\"CensusCode\":\"33703\",\"CountryCode\":\"CL\",\"MilitaryCode\":\"EE1\",\"Name\":\"Antofagasta, Chile\",\"PortCode\":\"ANF\",\"ShortName\":\"ANTOFAGASTA CHILE\",\"UNCode\":\"CLANF\"},\"vessel\":{\"id\":174,\"Code\":\"GE\",\"IMONumber\":\"9674177\",\"Name\":\"Glovis Supreme\"},\"voyageNum\":\"24\",\"ETA\":null,\"actualArrival\":null,\"departingVessel\":{\"id\":null,\"Code\":null,\"IMONumber\":null,\"Name\":null},\"departingVoyageNum\":null,\"ETD\":\"2020-08-12T04:00:00.000Z\",\"actualDeparture\":null},\"POD\":{\"port\":{\"id\":1071,\"CensusCode\":\"72337\",\"CountryCode\":\"TN\",\"MilitaryCode\":\"KD6\",\"Name\":\"Sfax, Tunisia\",\"PortCode\":\"SFA\",\"ShortName\":\"SFAX TUNISA\",\"UNCode\":\"TNSFA\"},\"vessel\":{\"id\":174,\"Code\":\"GE\",\"IMONumber\":\"9674177\",\"Name\":\"Glovis Supreme\"},\"voyageNum\":\"24\",\"ETA\":\"2020-08-19T04:00:00.000Z\",\"actualArrival\":null,\"departingVessel\":{\"id\":null,\"Code\":null,\"IMONumber\":null,\"Name\":null},\"departingVoyageNum\":null,\"ETD\":null,\"actualDeparture\":null},\"transshipments\":[],\"rates\":[],\"totalCost\":null,\"cargoDescription\":\"BOL FAKE BIG CARGO 2\",\"year\":null,\"make\":null,\"model\":null,\"color\":null,\"numAxles\":4,\"dims\":{\"unitOfMeasure\":3,\"length\":5,\"lengths\":{\"inch\":196.8503937007874,\"ft\":16.404199475065617,\"m\":5},\"width\":10,\"widths\":{\"inch\":393.7007874015748,\"ft\":32.808398950131235,\"m\":10},\"height\":15,\"heights\":{\"inch\":590.5511811023622,\"ft\":49.21259842519685,\"m\":15},\"volumes\":{\"inch\":45767808.07104921,\"ft\":26486.000041116444,\"m\":750},\"areas\":{\"inch\":77500.15500031,\"ft\":538.1955208354861,\"m\":50},\"weightUnit\":3,\"weight\":50000,\"weights\":{\"lb\":110231076.99844861,\"kg\":50000000,\"mt\":50000}},\"cargoType\":\"3\",\"cargoSubType\":5,\"cargoCondition\":1,\"mafi\":false,\"hazmat\":false,\"comments\":null,\"internalComments\":null,\"isVoid\":false,\"isDelete\":false,\"VIN\":\"FAKEVIN2\"}"
                },
                {
                    "CargoJson": "{\"id\":3,\"customerType\":\"C\",\"cargoStatus\":6,\"billingStatus\":null,\"bundleIndex\":2,\"bookingId\":1,\"bookingNumber\":\"LGL202008051001\",\"BOLId\":null,\"BOLNumber\":null,\"forwarder\":{\"address\":{\"accountId\":35,\"accountName\":null,\"address1\":\"456 Fake st\",\"address2\":null,\"addressId\":34,\"addressType\":null,\"addressTypeId\":2,\"city\":\"Fake\",\"country\":\"FAKE\",\"state\":\"FK\",\"zip\":\"11234\"},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":\"Deakins Logistics Group (DLG)\"},\"consignee\":{\"address\":{\"accountId\":null,\"accountName\":null,\"address1\":null,\"address2\":null,\"addressId\":null,\"addressType\":null,\"addressTypeId\":null,\"city\":null,\"country\":null,\"state\":null,\"zip\":null},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":null},\"shipper\":{\"address\":{\"accountId\":null,\"accountName\":null,\"address1\":null,\"address2\":null,\"addressId\":null,\"addressType\":null,\"addressTypeId\":null,\"city\":null,\"country\":null,\"state\":null,\"zip\":null},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":null},\"recDate\":null,\"AESITN\":null,\"HSCode\":null,\"customAppr\":null,\"custOut\":null,\"referenceNo\":null,\"POL\":{\"port\":{\"id\":53,\"CensusCode\":\"33703\",\"CountryCode\":\"CL\",\"MilitaryCode\":\"EE1\",\"Name\":\"Antofagasta, Chile\",\"PortCode\":\"ANF\",\"ShortName\":\"ANTOFAGASTA CHILE\",\"UNCode\":\"CLANF\"},\"vessel\":{\"id\":174,\"Code\":\"GE\",\"IMONumber\":\"9674177\",\"Name\":\"Glovis Supreme\"},\"voyageNum\":\"24\",\"ETA\":null,\"actualArrival\":null,\"departingVessel\":{\"id\":null,\"Code\":null,\"IMONumber\":null,\"Name\":null},\"departingVoyageNum\":null,\"ETD\":\"2020-08-12T04:00:00.000Z\",\"actualDeparture\":null},\"POD\":{\"port\":{\"id\":1071,\"CensusCode\":\"72337\",\"CountryCode\":\"TN\",\"MilitaryCode\":\"KD6\",\"Name\":\"Sfax, Tunisia\",\"PortCode\":\"SFA\",\"ShortName\":\"SFAX TUNISA\",\"UNCode\":\"TNSFA\"},\"vessel\":{\"id\":174,\"Code\":\"GE\",\"IMONumber\":\"9674177\",\"Name\":\"Glovis Supreme\"},\"voyageNum\":\"24\",\"ETA\":\"2020-08-19T04:00:00.000Z\",\"actualArrival\":null,\"departingVessel\":{\"id\":null,\"Code\":null,\"IMONumber\":null,\"Name\":null},\"departingVoyageNum\":null,\"ETD\":null,\"actualDeparture\":null},\"transshipments\":[],\"rates\":[],\"totalCost\":null,\"cargoDescription\":\"BOL FAKE BIG CARGO 3\",\"year\":null,\"make\":null,\"model\":null,\"color\":null,\"numAxles\":4,\"dims\":{\"unitOfMeasure\":3,\"length\":5,\"lengths\":{\"inch\":196.8503937007874,\"ft\":16.404199475065617,\"m\":5},\"width\":10,\"widths\":{\"inch\":393.7007874015748,\"ft\":32.808398950131235,\"m\":10},\"height\":15,\"heights\":{\"inch\":590.5511811023622,\"ft\":49.21259842519685,\"m\":15},\"volumes\":{\"inch\":45767808.07104921,\"ft\":26486.000041116444,\"m\":750},\"areas\":{\"inch\":77500.15500031,\"ft\":538.1955208354861,\"m\":50},\"weightUnit\":3,\"weight\":40000,\"weights\":{\"lb\":88184861.59875889,\"kg\":40000000,\"mt\":40000}},\"cargoType\":\"3\",\"cargoSubType\":5,\"cargoCondition\":1,\"mafi\":false,\"hazmat\":false,\"comments\":null,\"internalComments\":null,\"isVoid\":false,\"isDelete\":false,\"VIN\":\"FAKEVIN3\"}"
                },
                {
                    "CargoJson": "{\"id\":4,\"customerType\":\"C\",\"cargoStatus\":6,\"billingStatus\":null,\"bundleIndex\":3,\"bookingId\":1,\"bookingNumber\":\"LGL202008051001\",\"BOLId\":null,\"BOLNumber\":null,\"forwarder\":{\"address\":{\"accountId\":35,\"accountName\":null,\"address1\":\"456 Fake st\",\"address2\":null,\"addressId\":34,\"addressType\":null,\"addressTypeId\":2,\"city\":\"Fake\",\"country\":\"FAKE\",\"state\":\"FK\",\"zip\":\"11234\"},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":\"Deakins Logistics Group (DLG)\"},\"consignee\":{\"address\":{\"accountId\":null,\"accountName\":null,\"address1\":null,\"address2\":null,\"addressId\":null,\"addressType\":null,\"addressTypeId\":null,\"city\":null,\"country\":null,\"state\":null,\"zip\":null},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":null},\"shipper\":{\"address\":{\"accountId\":null,\"accountName\":null,\"address1\":null,\"address2\":null,\"addressId\":null,\"addressType\":null,\"addressTypeId\":null,\"city\":null,\"country\":null,\"state\":null,\"zip\":null},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":null},\"recDate\":null,\"AESITN\":null,\"HSCode\":null,\"customAppr\":null,\"custOut\":null,\"referenceNo\":null,\"POL\":{\"port\":{\"id\":53,\"CensusCode\":\"33703\",\"CountryCode\":\"CL\",\"MilitaryCode\":\"EE1\",\"Name\":\"Antofagasta, Chile\",\"PortCode\":\"ANF\",\"ShortName\":\"ANTOFAGASTA CHILE\",\"UNCode\":\"CLANF\"},\"vessel\":{\"id\":174,\"Code\":\"GE\",\"IMONumber\":\"9674177\",\"Name\":\"Glovis Supreme\"},\"voyageNum\":\"24\",\"ETA\":null,\"actualArrival\":null,\"departingVessel\":{\"id\":null,\"Code\":null,\"IMONumber\":null,\"Name\":null},\"departingVoyageNum\":null,\"ETD\":\"2020-08-12T04:00:00.000Z\",\"actualDeparture\":null},\"POD\":{\"port\":{\"id\":1071,\"CensusCode\":\"72337\",\"CountryCode\":\"TN\",\"MilitaryCode\":\"KD6\",\"Name\":\"Sfax, Tunisia\",\"PortCode\":\"SFA\",\"ShortName\":\"SFAX TUNISA\",\"UNCode\":\"TNSFA\"},\"vessel\":{\"id\":174,\"Code\":\"GE\",\"IMONumber\":\"9674177\",\"Name\":\"Glovis Supreme\"},\"voyageNum\":\"24\",\"ETA\":\"2020-08-19T04:00:00.000Z\",\"actualArrival\":null,\"departingVessel\":{\"id\":null,\"Code\":null,\"IMONumber\":null,\"Name\":null},\"departingVoyageNum\":null,\"ETD\":null,\"actualDeparture\":null},\"transshipments\":[],\"rates\":[],\"totalCost\":null,\"cargoDescription\":\"BOL FAKE BIG CARGO 4\",\"year\":null,\"make\":null,\"model\":null,\"color\":null,\"numAxles\":4,\"dims\":{\"unitOfMeasure\":3,\"length\":5,\"lengths\":{\"inch\":196.8503937007874,\"ft\":16.404199475065617,\"m\":5},\"width\":10,\"widths\":{\"inch\":393.7007874015748,\"ft\":32.808398950131235,\"m\":10},\"height\":15,\"heights\":{\"inch\":590.5511811023622,\"ft\":49.21259842519685,\"m\":15},\"volumes\":{\"inch\":45767808.07104921,\"ft\":26486.000041116444,\"m\":750},\"areas\":{\"inch\":77500.15500031,\"ft\":538.1955208354861,\"m\":50},\"weightUnit\":3,\"weight\":40000,\"weights\":{\"lb\":88184861.59875889,\"kg\":40000000,\"mt\":40000}},\"cargoType\":\"3\",\"cargoSubType\":5,\"cargoCondition\":1,\"mafi\":false,\"hazmat\":false,\"comments\":null,\"internalComments\":null,\"isVoid\":false,\"isDelete\":false,\"VIN\":\"FAKEVIN4\"}"
                },
                {
                    "CargoJson": "{\"id\":5,\"customerType\":\"C\",\"cargoStatus\":6,\"billingStatus\":null,\"bundleIndex\":4,\"bookingId\":1,\"bookingNumber\":\"LGL202008051001\",\"BOLId\":8,\"BOLNumber\":null,\"forwarder\":{\"address\":{\"accountId\":35,\"accountName\":null,\"address1\":\"456 Fake st\",\"address2\":null,\"addressId\":34,\"addressType\":null,\"addressTypeId\":2,\"city\":\"Fake\",\"country\":\"FAKE\",\"state\":\"FK\",\"zip\":\"11234\"},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":\"Deakins Logistics Group (DLG)\"},\"consignee\":{\"address\":{\"accountId\":null,\"accountName\":null,\"address1\":null,\"address2\":null,\"addressId\":null,\"addressType\":null,\"addressTypeId\":null,\"city\":null,\"country\":null,\"state\":null,\"zip\":null},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":null},\"shipper\":{\"address\":{\"accountId\":null,\"accountName\":null,\"address1\":null,\"address2\":null,\"addressId\":null,\"addressType\":null,\"addressTypeId\":null,\"city\":null,\"country\":null,\"state\":null,\"zip\":null},\"contact\":{\"name\":null,\"email\":null,\"fax\":null,\"phone\":null},\"DODACC\":null,\"name\":null},\"recDate\":null,\"AESITN\":null,\"HSCode\":null,\"customAppr\":null,\"custOut\":null,\"referenceNo\":null,\"POL\":{\"port\":{\"id\":53,\"CensusCode\":\"33703\",\"CountryCode\":\"CL\",\"MilitaryCode\":\"EE1\",\"Name\":\"Antofagasta, Chile\",\"PortCode\":\"ANF\",\"ShortName\":\"ANTOFAGASTA CHILE\",\"UNCode\":\"CLANF\"},\"vessel\":{\"id\":174,\"Code\":\"GE\",\"IMONumber\":\"9674177\",\"Name\":\"Glovis Supreme\"},\"voyageNum\":\"24\",\"ETA\":null,\"actualArrival\":null,\"departingVessel\":{\"id\":null,\"Code\":null,\"IMONumber\":null,\"Name\":null},\"departingVoyageNum\":null,\"ETD\":\"2020-08-12T04:00:00.000Z\",\"actualDeparture\":null},\"POD\":{\"port\":{\"id\":1071,\"CensusCode\":\"72337\",\"CountryCode\":\"TN\",\"MilitaryCode\":\"KD6\",\"Name\":\"Sfax, Tunisia\",\"PortCode\":\"SFA\",\"ShortName\":\"SFAX TUNISA\",\"UNCode\":\"TNSFA\"},\"vessel\":{\"id\":174,\"Code\":\"GE\",\"IMONumber\":\"9674177\",\"Name\":\"Glovis Supreme\"},\"voyageNum\":\"24\",\"ETA\":\"2020-08-19T04:00:00.000Z\",\"actualArrival\":null,\"departingVessel\":{\"id\":null,\"Code\":null,\"IMONumber\":null,\"Name\":null},\"departingVoyageNum\":null,\"ETD\":null,\"actualDeparture\":null},\"transshipments\":[],\"rates\":[],\"totalCost\":null,\"cargoDescription\":\"BOL FAKE BIG CARGO 5\",\"year\":null,\"make\":null,\"model\":null,\"color\":null,\"numAxles\":4,\"dims\":{\"unitOfMeasure\":3,\"length\":5,\"lengths\":{\"inch\":196.8503937007874,\"ft\":16.404199475065617,\"m\":5},\"width\":10,\"widths\":{\"inch\":393.7007874015748,\"ft\":32.808398950131235,\"m\":10},\"height\":15,\"heights\":{\"inch\":590.5511811023622,\"ft\":49.21259842519685,\"m\":15},\"volumes\":{\"inch\":45767808.07104921,\"ft\":26486.000041116444,\"m\":750},\"areas\":{\"inch\":77500.15500031,\"ft\":538.1955208354861,\"m\":50},\"weightUnit\":3,\"weight\":40000,\"weights\":{\"lb\":88184861.59875889,\"kg\":40000000,\"mt\":40000}},\"cargoType\":\"3\",\"cargoSubType\":5,\"cargoCondition\":1,\"mafi\":false,\"hazmat\":false,\"comments\":null,\"internalComments\":null,\"isVoid\":false,\"isDelete\":false,\"VIN\":\"FAKEVIN5\"}"
                }
            ];
            tmp.forEach(item => {
                item = JSON.parse(item.CargoJson);
                switch(item.customerType) {
                    case 'C':
                        commercialCargo.push(new CommercialCargo3(item));
                        break;
                    case 'M':
                        break;
                }
            });
            loadCommercialCargoTable();
}


class Customer {
    constructor(companyName, customerID, customerTypeID, FMCNumber, DODACC) {
        this.companyName = companyName ? companyName : "";
        this.customerID = customerID ? customerID : "";
        this.customerTypeID = customerTypeID ? customerTypeID : "";
        this.FMCNumber = FMCNumber ? FMCNumber : "";
        this.DODACC = DODACC ? DODACC : "";
        this.accountList = [];
    }

    addAddress(newAddress) {
        this.accountList.push(newAddress);
    }

    deepCopy(customerObj) {
        this.companyName = customerObj.companyName;
        this.customerID = customerObj.customerID;
        this.customerTypeID = customerObj.customerTypeID;
        this.FMCNumber = customerObj.FMCNumber;
        this.DODACC = customerObj.DODACC;
        this.accountList = [];
        customerObj.accountList.forEach(accountListItem => {
            let tmp = new Account();
            tmp.deepCopy(accountListItem);
            this.accountList.push(tmp);
        })
    }
}
class Account {
    constructor(accountName, address1, address2, city, state, country, zip, addressTypeID, addressType, addressID, accountID) {
        this.accountName = accountName ? accountName : "";
        this.address1 = address1 ? address1 : "";
        this.address2 = address2 ? address2 : "";
        this.city = city ? city : "";
        this.state = state ? state : "";
        this.country = country ? country : "";
        this.zip = zip ? zip : "";
        this.addressTypeID = addressTypeID ? addressTypeID : "";
        this.addressType = addressType ? addressType : "";
        this.addressID = addressID ? addressID : "";
        this.accountID = accountID ? accountID : "";
    }

    //Creates an address string for the address stored in this object and returns it
    createAddresssString() {
        return this.address1 + " " + this.address2 + " " + this.city + " " + this.state + " " + this.zip; 
    }

    deepCopy(accountObj) {
        this.accountName = accountObj.accountName;
        this.address1 = accountObj.address1;
        this.address2 = accountObj.address2;
        this.city = accountObj.city;
        this.state = accountObj.state;
        this.country = accountObj.country;
        this.zip = accountObj.zip;
        this.addressTypeID = accountObj.addressTypeID;
        this.addressType = accountObj.addressType;
        this.addressID = accountObj.addressID;
        this.accountID = accountObj.accountID;
    }
}
class Dims {
    constructor (obj){
        if(obj) {
            this.unitOfMeasure = obj.unitOfMeasure;
            this.length = obj.length ? obj.length : null;
            this.lengths = obj.lengths ? obj.lengths : {inch: null, ft: null, m: null};
            this.width = obj.width ? obj.width : null;
            this.widths = obj.widths ? obj.widths : {inch: null, ft: null, m: null};
            this.height = obj.height ? obj.height : null;
            this.heights = obj.heights ? obj.heights : {inch: null, ft: null, m: null};
            this.volumes = obj.volumes ? obj.volumes : {inch: null, ft: null, m: null};
            this.areas = obj.areas ? obj.areas : {inch: null, ft: null, m: null};
            this.weightUnit = obj.weightUnit ? obj.weightUnit : null;
            this.weight = obj.weight ? obj.weight : null;
            this.weights = obj.weights ? obj.weights : {lb: null, kg: null, mt: null};
        } else {
            this.unitOfMeasure = null;
            this.length = null;
            this.lengths = {inch: null, ft: null, m: null};
            this.width = null;
            this.widths = {inch: null, ft: null, m: null};
            this.height = null;
            this.heights = {inch: null, ft: null, m: null};
            this.volumes = {inch: null, ft: null, m: null};
            this.areas = {inch: null, ft: null, m: null};
            this.weightUnit = null;
            this.weight = null;
            this.weights = {lb: null, kg: null, mt: null};
        }
    }   
    setLength(decimal){ 
        this.length=decimal;
    }
    setWidth(decimal){ 
        this.width=decimal;
    }
    setHeight(decimal) {
        this.height = decimal;
    }
    setWeight(decimal){ 
        this.weight=decimal;
    }
    getArea(){return this.width*this.length}
    getVolume(){return this.width*this.length*this.height}
        
}    
class Entity {
    constructor(obj) {
        if(obj) {
            this.address = obj.address ? new Account3(obj.address) : new Account3();
            this.contact = obj.contact ? new Contact(obj.contact) : new Contact();
            this.DODACC = obj.DODACC ? obj.DODACC : null;
            this.name = obj.name ? obj.name : null;
        } else {
            this.address = new Account3();
            this.contact = new Contact();
            this.DODACC = null;
            this.name = null;
        }
    }
}
class portSegment {
    constructor(obj) {
        if(obj) {
            this.port = obj.port ? new Port3(obj.port) : new Port3();
            //Arrival
            this.vessel = obj.vessel ? new Vessel3(obj.vessel) : new Vessel3();
            this.voyageNum = obj.voyageNum ? obj.voyageNum : null;
            this.ETA = obj.ETA ? obj.ETA : null;
            this.actualArrival  = obj.actualArrival ? obj.actualArrival : null;
            //Departure
            this.departingVessel = obj.departingVessel ? new Vessel3(obj.departingVessel) : new Vessel3();
            this.departingVoyageNum = obj.departingVoyageNum ? obj.departingVoyageNum : null;
            this.ETD = obj.ETD ? obj.ETD : null;
            this.actualDeparture = obj.actualDeparture ? obj.actualDeparture : null;
        } else {
            this.port = new Port3();
            this.vessel = new Vessel3();
            this.voyageNum = null;
            this.ETA = null;
            this.actualArrival = null
            this.departingVessel = null;
            this.departingVoyageNum = null;
            this.ETD = null;
            this.actualDeparture = null;
        }
    }
}

class Rates {
    constructor(obj) {
        if(obj) {
            this.rateType = obj.rateType ? obj.rateType : null;
            this.rate = obj.rate ? obj.rate : null;
            this.unitType = obj.unitType ? obj.unitType : null;
            this.unitTypeAmount = obj.unitTypeAmount ? obj.unitTypeAmount : null;
            this.cost = obj.cost ? obj.cost : null;
        } else {
            this.rateType = null;
            this.rate = null;
            this.unitType = null;
            this.unitTypeAmount = null;
            this.cost = null;
        }
    }
}

class Cargo3 {
    constructor(obj) {
        if(obj) {
            //Details pretaining to the cargo
            this.id = obj.id ? obj.id : null;
            this.customerType = obj.customerType ? obj.customerType : null;
            this.cargoStatus = obj.cargoStatus ? obj.cargoStatus : null;
            this.billingStatus = obj.billingStatus ? obj.billingStatus : null;
            this.bundleIndex = obj.bundleIndex !== null ? obj.bundleIndex : null;
            this.bookingId = obj.bookingId !== null ? obj.bookingId : null;
            this.bookingNumber = obj.bookingNumber ? obj.bookingNumber : null;
            this.BOLId = obj.BOLId ? obj.BOLId : null;
            this.BOLNumber = obj.BOLNumber ? obj.BOLNumber : null;
            this.forwarder = obj.forwarder ? new Entity(obj.forwarder) : new Entity();
            this.consignee = obj.consignee ? new Entity(obj.consignee) : new Entity();
            this.recdate = obj.recdate ? obj.recdate : null;
            this.AESITN = obj.AESITN ? obj.AESITN : null;
            this.HSCode = obj.HSCode ? obj.HSCode : null;
            this.customapprv = obj.customapprv ? obj.customapprv : null;
            this.custout = obj.custout ? obj.custout : null;
            this.referenceno = obj.referenceno ? obj.referenceno : null;
            this.POL = obj.POL ? new portSegment(obj.POL) : new portSegment();
            this.POD = obj.POD ? new portSegment(obj.POD) : new portSegment();
            if(obj.transshipments) {
                if(obj.transshipments.length > 0) {
                    this.transshipments = [];
                    obj.transshipments.forEach(item => {
                        this.transshipments.push(new portSegment(item));
                    });
                } else {
                    this.transshipments = [];
                };
            } else {
                this.transshipments = [];
            }
            if(obj.rates) {
                if(obj.rates.length > 0) {
                    this.rates = [];
                    obj.rates.forEach(item => {
                        this.rates.push(new Rates(item));
                    })
                } else {
                    this.rates = [];
                }
            } else {
                this.rates = [];
            }
            this.totalCost = obj.totalCost ? obj.totalCost : null;
            //Details about the cargo itself
            this.cargoDescription = obj.cargoDescription ? obj.cargoDescription : null;
            this.year = obj.year ? obj.year : null;
            this.make = obj.make ? obj.make : null;
            this.model = obj.model ? obj.model : null;
            this.color = obj.color ? obj.color : null;
            this.numAxles = obj.numAxles ? obj.numAxles : null;
            this.dims = obj.dims ? new Dims(obj.dims) : new Dims();
            this.cargoType = obj.cargoType ? obj.cargoType : null;
            this.cargoSubType = obj.cargoSubType ? obj.cargoSubType : null;
            this.cargoCondition = obj.cargoCondition ? obj.cargoCondition : null;
            this.mafi = obj.mafi ? obj.mafi : false;
            this.hazmat = obj.hazmat ? obj.hazmat : false;
            this.comments = obj.comments ? obj.comments : null;
            this.internalComments = obj.internalComments ? obj.internalComments : null;
            this.isVoid = obj.isVoid ? obj.isVoid : false;
            this.isDelete = obj.isDelete ? obj.isDelete : false;
        } else {
            this.id = null;
            this.customerType = null;
            this.cargoStatus  = 6;
            this.billingStatus = null;
            this.bundleIndex = null;
            this.bookingId = null;
            this.bookingNumber = null;
            this.BOLId = null;
            this.BOLNumber = null;
            this.forwarder = new Entity();
            this.consignee = new Entity();
            this.recdate = null;
            this.AESITN = null;
            this.HSCode = null;
            this.customapprv = null;
            this.referenceno = null;
            this.POL = new portSegment();
            this.POD = new portSegment();
            this.transshipments = [];
            this.rates = [];
            this.totalCost = null;
            this.cargoDescription = null;
            this.year = null;
            this.make = null;
            this.model = null;
            this.color = null;
            this.numAxles = null;
            this.dims = new Dims();
            this.cargoType = null;
            this.cargoSubType = null;
            this.cargoCondition = null;
            this.mafi =  null;
            this.hazmat = null;
            this.comments = null;
            this.internalComments = null;
            this.isVoid = false;
            this.isDelete = false;
        }
    }
    addPOL(port, ETD, actualDeparture, vessel, voyageNum) {
        this.POL = new portSegment({
            port: port,
            arrivingVessel: null,
            arrivingVoyageNum: null,
            ETA: null,
            actualArrival: null,
            departingVessel: vessel,
            departingVoyageNum: voyageNum,
            ETD: ETD,
            actualDeparture: actualDeparture
        });
    }
    addPOD(port, ETA, actualArrival, vessel, voyageNum) {
        this.POD = new portSegment({
            port: port,
            arrivingVessel: vessel,
            arrivingVoyageNum: voyageNum,
            ETA: ETA,
            actualArrival: actualArrival,
            departingVessel: null,
            departingVoyageNum: null,
            ETD: null,
            actualDeparture: null
        });
    }
    addTransshipment(port, ETA, ETD, arrivingVessel, arrivingVoyageNum, departingVessel, departingVoyageNum) {
        this.transshipments.push(new portSegment({
            'port': port ? new Port3(port) : new Port3(),
            'vessel': arrivingVessel ? new Vessel3(arrivingVessel) : new Vessel3(),
            'voyageNum': arrivingVoyageNum,
            'ETA': ETA,
            'actualArrival': null,
            'departingVessel': departingVessel,
            'departingVoyageNum': departingVoyageNum,
            'ETD': ETD,
            'actualDeparture': null
        }));
        console.log(this.transshipments);
    }
    addRates(rateObj) {
        this.rates.push(new Rates(rateObj));
    }
    clearRates() {
        this.rates = [];
    }
}

class CommercialCargo3 extends Cargo3 {
    constructor(obj) {
        if(obj) {
            super(obj);
            this.customerType = 'C'; //C for Commercial
            this.VIN = obj.VIN ? obj.VIN : null;
        } else {
            super();
            this.customerType = 'C'; //C for Commercial
            this.VIN = null;
        }
    }
    copyBookingInfo(obj) {
        this.bookingId = obj.bookingId ? obj.bookingId : null;
        this.bookingNumber = obj.bookingnumber ? obj.bookingNumber : null;
        this.forwarder = obj.forwarder ? new Entity(obj.forwarder) : new Entity();
        this.consignee = obj.consignee ? new Entity(obj.consignee) : new Entity();
        this.recdate = obj.recdate ? obj.recdate : null;
        this.customapprv = obj.customapprv ? obj.customapprv : null;
        this.referenceno = obj.referenceno ? obj.referenceno : null;
        this.POL = obj.POL ? new portSegment(obj.POL) : new portSegment();
        this.POD = obj.POD ? new portSegment(obj.POD) : new portSegment();
        if(obj.transshipments) {
            if(obj.transshipments.length > 0) {
                this.transshipments = [];
                obj.transshipments.forEach(item => {
                    this.transshipments.push(new portSegment(item));
                });
            } else {
                this.transshipments = [];
            };
        } else {
            this.transshipments = [];
        }
        this.cargoType = obj.cargoType ? obj.cargoType : null;
        this.cargoSubType = obj.cargoSubType ? obj.cargoSubType : null;
        this.cargoCondition = obj.cargoCondition ? obj.cargoCondition : null;
    }
}

class MilitaryCargo3 extends Cargo3 {
    constructor(obj) {
        if(obj) {
            super(obj);
            this.customerType = 'M'; //M for Military
            this.TCN = obj.TCN ? obj.TCN : null;
            this.commodityCode = obj.commodityCode ? obj.commodityCode : null;
        } else {
            super();
            this.customerType = 'M'; //M for Military
            this.TCN = null;
            this.commodityCode = null;
        }
    }
}

class Booking3 {
    constructor(obj) {
        if(obj) {
            this.id = obj.id ? obj.id : null;
            this.bookingNumber = obj.bookingNumber ? obj.bookingNumber : null;
            this.bookingStatus = obj.bookingStatus ? obj.bookingStatus : null;
            this.bookingType = obj.bookingType ? obj.bookingType : null;
            this.customerType = obj.customerType ? obj.customerType : null;
            this.comments = obj.comments ? obj.comments : null;
            this.commision = obj.commision ? new Commision(obj.commision) : new Commision();
            this.contact = obj.contact ? new Contact(obj.contact) : new Contact();
            this.customer = obj.customer ? new Customer3(obj.customer) : new Customer3();
            this.dateStamp = obj.dateStamp ? obj.dateStamp : null;
            this.effectiveDate = obj.effectiveDate ? obj.effectiveDate : null;
            this.freightTerms = obj.freightTerms ? obj.freightTerms : null;
            this.internalComments = obj.internalComments ? obj.internalComments : null;
            this.isDelete = obj.isDelete ? obj.isDelete : false;
            this.isVoid = obj.isVoid ? obj.isVoid : false;
            this.portOfDischarge = obj.portOfDischarge ? new Port3(obj.portOfDischarge) : new Port3();
            this.portOfLoad = obj.portOfLoad ? new Port3(obj.portOfLoad) : new Port3();
            if(obj.rollLog) {
                this.rollLog = [];
                if(obj.rollLog.length > 0) {
                    obj.rollLog.forEach(item => {
                        this.rollLog.push([]);
                        item.forEach(item2 => {
                            this.rollLog[this.rollLog.length - 1].push(new RollLogObj(item2));
                        })
                    });
                }
            }
            this.shipper = obj.shipper ? obj.shipper : null;
            this.shippingTerms = obj.shippingTerms ? obj.shippingTerms : null;
            this.totalCost = obj.totalCost ? obj.totalCost : null;
            this.totalQuantity = obj.totalQuantity ? obj.totalQuantity : null;
            this.totalDims = obj.totalDims ? obj.totalDims : null;
            this.usFlag = obj.usFlag ? obj.usFlag : false;
            this.user = obj.user ? obj.user : null;
            this.validityDate = obj.validityDate ? obj.validityDate : null;
            if(obj.bookedCargo) {
                this.bookedCargo = [];
                if(obj.bookedCargo.length > 0) {
                    obj.bookedCargo.forEach(bundle => {
                        this.bookedCargo.push([]);
                        bundle.forEach(item => {
                            switch(item.customerType) {
                                case 'C':
                                    this.bookedCargo[this.bookedCargo.length - 1].push(new CommercialCargo3(item));
                                    break;
                                case 'M':
                                    this.bookedCargo[this.bookedCargo.length - 1].push(new MilitaryCargo3(item));
                                    break;
                            }
                        })
                    })
                }
            }
        } else {
            this.id = null;
            this.bookingNumber = null;
            this.bookingStatus = 1;
            this.bookingType = null;
            this.customerType = null;
            this.comments = null;
            this.commision = new Commision();
            this.contact = new Contact();
            this.customer = new Customer3();
            this.dateStamp = null;
            this.effectiveDate = null;
            this.freightTerms = null;
            this.internalComments = null;
            this.isDelete = false;
            this.isVoid = false;
            this.portOfDischarge = new Port3();
            this.portOfLoad = new Port3();
            this.rollLog = [];
            this.shipper = null;
            this.shippingTerms = null;
            this.totalCost = null;
            this.usFlag = false;
            this.user = null;
            this.validityDate = null;
            this.bookedCargo = [];
        }
    }
    startRollLog() {
        this.rollLog = [];
        let totalCargo = 0;
        this.bookedCargo.forEach(bookedCargoItem => {
            totalCargo += bookedCargoItem.length;
        })
        let tmpRollArr = [{
            vessel: this.bookedCargo[0][0].POL.vessel,
            voyageNum: this.bookedCargo[0][0].POL.voyageNum,
            ETD: this.bookedCargo[0][0].POL.ETD,
            ETA: this.bookedCargo[0][0].POD.ETA,
            cargo: totalCargo
        }]
        this.rollLog.push(tmpRollArr);
    }
    updateRollLog() {
        let tmpRollArr = [];
        this.bookedCargo.forEach(bundle => {
            bundle.forEach(bundleItem => {
                //Filter to see if this vessel is in the temporary roll log
                //Find returns a reference to the found element
                let found = tmpRollArr.find(tmpRollArrItem => {
                    return tmpRollArrItem.vessel.id == bundleItem.POL.vessel.id;
                })
                //If no filter results are found
                if(!found) {
                    let tmpRollObj = {
                        vessel: bundleItem.POL.vessel,
                        voyageNum: bundleItem.POL.voyageNum,
                        ETD: bundleItem.POL.ETD,
                        ETA: bundleItem.POD.ETA,
                        cargo: 1
                    }
                    tmpRollArr.push(tmpRollObj);
                //Else increment the cargo count in the related roll object
                } else {
                    found.cargo++;
                }
            })
        })
        this.rollLog.push(tmpRollArr);
    }
}

class CommercialBooking3 extends Booking3 {
    constructor(obj) {
        if(obj) {
            super(obj);
            this.customerType = 'C';
        } else {
            super();
            this.customerType = 'C';
        }
    }
    bookingRequestMapper(request) {
        this.bookingStatus = 1;
        this.bookingType = 5;
        this.commision = new Commision();
        this.contact = new Contact({
            name: request.requestDetails.BookingContactInfo[0].Name,
            email: request.requestDetails.BookingContactInfo[0].Email,
            fax: request.requestDetails.BookingContactInfo[0].Fax,
            phone: request.requestDetails.BookingContactInfo[0].TelephoneNumber
        });
        this.customer = new Customer3({
            DODACC: request.customer.DODACC ? request.customer.DODACC : null,
            FMCNumber: request.customer.FMCNumber ? request.customer.FMCNumber : null,
            companyName: request.customer.companyName ? request.customer.companyName : null,
            customerId: request.customer.customerID ? request.customer.customerID : null,
            customerTypeId: request.customer.customerTypeID ? request.customer.customerTypeID : null,
            account: new Account3({
                accountId: request.customer.account.accountID ? request.customer.account.accountID : null,
                accountName: request.customer.account.accountName ? request.customer.account.accountName : null,
                address1: request.customer.account.address1 ? request.customer.account.address1 : null,
                address2: request.customer.account.address2 ? request.customer.account.address2 : null,
                addressId: request.customer.account.addressID ? request.customer.account.addressID : null,
                addressTypeId: request.customer.account.addressTypeID ? request.customer.account.addressTypeID : null,
                city: request.customer.account.city ? request.customer.account.city : null,
                country: request.customer.account.country ? request.customer.account.country : null,
                state: request.customer.account.state ? request.customer.account.state : null,
                zip: request.customer.account.zip ? request.customer.account.zip : null
            })
        });
        this.freightTerms = 2;
        this.portOfDischarge = new Port3(request.requestDetails.PortInfo.PortOfDischarge);
        this.portOfLoad = new Port3(request.requestDetails.PortInfo.PortOfLoad);
        this.shipper = request.requestDetails.EntityInfo.Shipper.Name;
        this.shippingTerms = 2;
        this.usFlag = true;
        this.bookedCargo = [];
        request.requestDetails.Cargo.forEach(item => {
            let tmpCargoType, tmpCargoSubType, tmpWeight, tmpLength, tmpWidth, tmpHeight;
            switch(item.CargoSubType.toUpperCase()){
                case 'BREAKBULK RO/RO':
                case 'BREAKBULK RORO':
                case 'RORO':
                case 'RO/RO':
                    tmpCargoSubType = 5;
                    tmpCargoType = 3;
                    break;
                case 'BREAKBULK STATIC':
                case 'BREAKBULK STC':
                case 'STATIC':
                case 'STC':
                    tmpCargoSubType = 7;
                    tmpCargoType = 3;
                    break;
                case 'BREAKBULK TRACKED':
                case 'TRACKED':
                    tmpCargoSubType = 6;
                    tmpCargoType = 3;
                    break;
                case 'BREAKBULK MAFI':
                case 'MAFI':
                    tmpCargoSubType = 8;
                    tmpCargoType = 3;
                    break;
                default:
                    break;
            }
            tmpWeight = parseFloat(item.Weight);
            tmpLength = parseFloat(item.Length);
            tmpWidth = parseFloat(item.Width);
            tmpHeight = parseFloat(item.Height);
            this.bookedCargo.push([new CommercialCargo3({
                cargoStatus : 6,
                bundleIndex: this.bookedCargo.length,
                forwarder: new Entity({
                    address: new Account3({
                        accountId: request.customer.account.accountID ? request.customer.account.accountID : null,
                        accountName: request.customer.account.accountName ? request.customer.account.accountName : null,
                        address1: request.customer.account.address1 ? request.customer.account.address1 : null,
                        address2: request.customer.account.address2 ? request.customer.account.address2 : null,
                        addressId: request.customer.account.addressID ? request.customer.account.addressID : null,
                        addressTypeId: request.customer.account.addressTypeID ? request.customer.account.addressTypeID : null,
                        city: request.customer.account.city ? request.customer.account.city : null,
                        country: request.customer.account.country ? request.customer.account.country : null,
                        state: request.customer.account.state ? request.customer.account.state : null,
                        zip: request.customer.account.zip ? request.customer.account.zip : null
                    }),
                    contact: new Contact(),
                    DODACC: request.customer.DODACC ? request.customer.DODACC : null,
                    name: request.customer.companyName ? request.customer.companyName : null
                }),
                POL: new portSegment({
                    port: new Port3(request.requestDetails.PortInfo.PortOfLoad),
                    vessel: new Vessel3(request.requestDetails.Vessels[0].Vessel),
                    voyageNum: request.requestDetails.Vessels[0].Voyage,
                    ETA: null,
                    actualArrival: null,
                    departingVessel: null,
                    departingVoyageNum: null,
                    ETD: null,
                    actualDeparture: null
                }),
                POD: new portSegment({
                    port: new Port3(request.requestDetails.PortInfo.PortOfDischarge),
                    vessel: new Vessel3(request.requestDetails.Vessels[0].Vessel),
                    voyageNum: request.requestDetails.Vessels[0].Voyage,
                    ETA: null,
                    actualArrival: null,
                    departingVessel: null,
                    departingVoyageNum: null,
                    ETD: null,
                    actualDeparture: null
                }),
                cargoDescription: item.CargoDescription,
                dims: new Dims({
                    unitOfMeasure: item.dimTypeID,
                    length: tmpLength,
                    width: tmpWidth,
                    height: tmpHeight,
                    weightUnit: item.weightTypeID,
                    weight: tmpWeight
                }),
                cargoType: tmpCargoType,
                cargoSubType: tmpCargoSubType,
                cargoCondition: item.SelfPropelled ? 1 : 3,
                mafi:  item.mafi ? true : false,
                hazmat: item.hazmat ? true : false,
                VIN: item.VIN_SerialNumber
            })]);
        })
    }
}

class MilitaryBooking3 extends Booking3 {
    constructor(obj) {
        if(obj) {
            super(obj);
            this.customerType = 'M';
            this.PCFN = obj.PCFN ? obj.PCFN : null;
            this.consignee = obj.consignee ? new Entity(obj.consignee) : new Entity();
            this.shipper = obj.shipper ? new Entity(obj.shipper) : new Entity();
            this.FMSNumber = obj.FMSNumber ? obj.FMSNumber : null;
            this.contractNumber = obj.contractNumber ? obj.contractNumber : null;
            this.subContractNumber = obj.subContractNumber ? obj.subContractNumber : null;
            this.voyDoc = obj.voyDoc ? obj.voyDoc : null;
            this.K1Message = obj.K1Message ? obj.K1Message : null;
            this.RDD = obj.RDD ? obj.RDD : null;
            this.OTO = obj.OTO ? obj.OTO : false;
            this.MM = obj.MM ? obj.MM : false;
            this.specialHandlingInstructions = [];
            if(obj.specialHandlingInstructions.length > 0) {
                obj.specialHandlingInstructions.forEach(item => {
                    this.specialHandlingInstructions.push(new SpecialHandlingInstructions(item));
                })
            }
        } else {
            super();
            this.customerType = 'M';
            this.PCFN = null;
            this.consignee = new Entity();
            this.shipper = new Entity();
            this.FMSNumber = null;
            this.contractNumber = null;
            this.subContractNumber = null;
            this.voyDoc = null;
            this.K1Message = null;
            this.RDD = null;
            this.OTO = false;
            this.MM = false;
            this.specialHandlingInstructions = [];
        }
    }
    bookingRequestMapper(request) {
        this.bookingStatus = 1;
        this.commision = new Commision();
        this.PCFN = request.ReferenceInfo.PCFN ? request.ReferenceInfo.PCFN : null;
        this.consignee = new Entity({
            address: new Account3({
                accountId: null,
                accountName: null,
                address1: request.EntityInfo.Consignee.Address.Address1 ? request.EntityInfo.Consignee.Address.Address1 : '',
                address2: request.EntityInfo.Consignee.Address.Address2 ? request.EntityInfo.Consignee.Address.Address2 : '',
                addressId: null,
                addressType: null,
                city: request.EntityInfo.Consignee.Address.City ? request.EntityInfo.Consignee.Address.City : '',
                country: request.EntityInfo.Consignee.Address.CountryCode ? request.EntityInfo.Consignee.Address.CountryCode : '',
                state: request.EntityInfo.Consignee.Address.StateCode ? request.EntityInfo.Consignee.Address.StateCode : '',
                zip: request.EntityInfo.Consignee.Address.PostalCode ? request.EntityInfo.Consignee.Address.PostalCode : '' 
            }),
            contact: new Contact({
                name: request.EntityInfo.Consignee.Contacts[0] ? request.EntityInfo.Consignee.Contacts[0].Name : '',
                email: request.EntityInfo.Consignee.Contacts[0] ? request.EntityInfo.Consignee.Contacts[0].Email : '',
                fax: request.EntityInfo.Consignee.Contacts[0] ? request.EntityInfo.Consignee.Contacts[0].Fax : '',
                phone: request.EntityInfo.Consignee.Contacts[0] ? request.EntityInfo.Consignee.Contacts[0].TelephoneNumber : ''
            }),
            DODACC: request.EntityInfo.Consignee.DODACC ? request.EntityInfo.Consignee.DODACC : '',
            name: request.EntityInfo.Consignee.Name ? request.EntityInfo.Consignee.Name : '' 
        });
        this.shipper = new Entity({
            address: new Account3({
                accountId: null,
                accountName: null,
                address1: request.EntityInfo.Shipper.Address.Address1 ? request.EntityInfo.Shipper.Address.Address1 : '',
                address2: request.EntityInfo.Shipper.Address.Address2 ? request.EntityInfo.Shipper.Address.Address2 : '',
                addressId: null,
                addressType: null,
                city: request.EntityInfo.Shipper.Address.City ? request.EntityInfo.Shipper.Address.City : '',
                country: request.EntityInfo.Shipper.Address.CountryCode ? request.EntityInfo.Shipper.Address.CountryCode : '',
                state: request.EntityInfo.Shipper.Address.StateCode ? request.EntityInfo.Shipper.Address.StateCode : '',
                zip: request.EntityInfo.Shipper.Address.PostalCode ? request.EntityInfo.Shipper.Address.PostalCode : '' 
            }),
            contact: new Contact({
                name: request.EntityInfo.Shipper.Contacts[0] ? request.EntityInfo.Shipper.Contacts[0].Name : '',
                email: request.EntityInfo.Shipper.Contacts[0] ? request.EntityInfo.Shipper.Contacts[0].Email : '',
                fax: request.EntityInfo.Shipper.Contacts[0] ? request.EntityInfo.Shipper.Contacts[0].Fax : '',
                phone: request.EntityInfo.Shipper.Contacts[0] ? request.EntityInfo.Shipper.Contacts[0].TelephoneNumber : ''
            }),
            DODACC: request.EntityInfo.Shipper.DODACC ? request.EntityInfo.Shipper.DODACC : '',
            name: request.EntityInfo.Shipper.Name ? request.EntityInfo.Shipper.Name : '' 
        });
        this.FMSNumber = request.ReferenceInfo.ForeginMilitarySalesCaseNumber ? request.ReferenceInfo.ForeginMilitarySalesCaseNumber : null;
        this.contractNumber = request.ReferenceInfo.ContractNumber ? request.ReferenceInfo.ContractNumber : null;
        this.subContractNumber = request.ReferenceInfo.SubContractNumber ? request.ReferenceInfo.SubContractNumber : null;
        this.voyDoc = request.ReferenceInfo.MilitaryVoyageNumber ? request.ReferenceInfo.MilitaryVoyageNumber : null;
        this.K1Message = request.ReferenceInfo.Comments ? request.ReferenceInfo.Comments : null;
        this.RDD = request.RequiredDeliveryDate ? request.RequiredDeliveryDate : null;
        this.specialHandlingInstructions = [];
        if(request.SpecialHandlingInstructions.length > 0) {
            request.SpecialHandlingInstructions.forEach(item => {
                this.specialHandlingInstructions.push(new SpecialHandlingInstructions({
                    code: item.Code,
                    name: item.Name
                }));
            });
        }
        this.contact = new Contact({
            name: request.BookingContactInfo[0].Name ? request.BookingContactInfo[0].Name : '',
            email: request.BookingContactInfo[0].Email ? request.BookingContactInfo[0].Email : '',
            fax: request.BookingContactInfo[0].Fax ? request.BookingContactInfo[0].Fax : '',
            phone: request.BookingContactInfo[0].TelephoneNumber ? request.BookingContactInfo[0].TelephoneNumber : ''
        });
        this.customer = new Customer3({
            DODACC: request.Customer.DODACC ? request.Customer.DODACC : null,
            FMCNumber: request.Customer.FMCNumber ? request.Customer.FMCNumber : null,
            companyName: request.Customer.companyName ? request.Customer.companyName : null,
            customerId: request.Customer.customerID ? request.Customer.customerID : null,
            customerTypeId: request.Customer.customerTypeID ? request.Customer.customerTypeID : null,
            account: new Account3({
                accountId: request.Customer.account.accountID ? request.Customer.account.accountID : null,
                accountName: request.Customer.account.accountName ? request.Customer.account.accountName : null,
                address1: request.Customer.account.address1 ? request.Customer.account.address1 : null,
                address2: request.Customer.account.address2 ? request.Customer.account.address2 : null,
                addressId: request.Customer.account.addressID ? request.Customer.account.addressID : null,
                addressTypeId: request.Customer.account.addressTypeID ? request.Customer.account.addressTypeID : null,
                city: request.Customer.account.city ? request.Customer.account.city : null,
                country: request.Customer.account.country ? request.Customer.account.country : null,
                state: request.Customer.account.state ? request.Customer.account.state : null,
                zip: request.Customer.account.zip ? request.Customer.account.zip : null
            })
        });
        this.dateStamp = request.Date ? request.Date : null;
        this.portOfDischarge = new Port3(request.PortInfo.PortOfDischarge);
        this.portOfLoad = new Port3(request.PortInfo.PortOfLoad);
        switch(request.ReferenceInfo.ClassOfContractCode) {
            case 'F1':
                this.shippingTerms = 7;
                break;
            case 'F2':
                this.shippingTerms = 8;
                break;
            case 'F3':
                this.shippingTerms = 9;
                break;
            case 'F4':
                this.shippingTerms = 10;
                break;
            case 'F5':
                this.shippingTerms = 11;
                break;
            case 'F6':
                this.shippingTerms = 12;
                break;
            case 'F7':
                this.shippingTerms = 13;
                break;
            case 'F8':
                this.shippingTerms = 14;
                break;
            case 'F9':
                this.shippingTerms = 15;
                break;
        }
        this.bookedCargo = [];
        request.Cargo.forEach(item => {
            let tmpCargoType, tmpCargoSubType, tmpWeightUnit, tmpWeight, tmpDimsUnit, tmpLength, tmpWidth, tmpHeight;
            switch(item.CargoSubType.toUpperCase()){
                case 'BREAKBULK RO/RO':
                case 'BREAKBULK RORO':
                case 'RORO':
                case 'RO/RO':
                    tmpCargoSubType = 5;
                    tmpCargoType = 3;
                    break;
                case 'BREAKBULK STATIC':
                case 'BREAKBULK STC':
                case 'STATIC':
                case 'STC':
                    tmpCargoSubType = 7;
                    tmpCargoType = 3;
                    break;
                case 'BREAKBULK TRACKED':
                case 'TRACKED':
                    tmpCargoSubType = 6;
                    tmpCargoType = 3;
                    break;
                case 'BREAKBULK MAFI':
                case 'MAFI':
                    tmpCargoSubType = 8;
                    tmpCargoType = 3;
                    break;
                default:
                    break;
            }
            switch(item.WeightUnit.toUpperCase()) {
                case 'POUNDS':
                case 'LBS':
                    tmpWeightUnit = 1;
                    break;
                case 'KILOGRAMS':
                case 'KILOS':
                case 'KG':
                    tmpWeightUnit = 2;
                    break;
                case 'METRIC TONS':
                case 'MT':
                case 'MTS':
                    tmpWeightUnit = 3;
                    break;
            }
            tmpWeight = parseInt(item.Weight);
            switch(item.DimsUnit.toUpperCase()) {
                case 'INCHES':
                case 'INCH':
                    tmpDimsUnit = 1;
                    break;
                case 'FEET':
                case 'FT':
                    tmpDimsUnit = 2;
                    break;
                case 'METERS':
                case 'M':
                    tmpDimsUnit = 3;
                    break;
            }
            tmpLength = parseInt(item.Length);
            tmpWidth = parseInt(item.Width);
            tmpHeight = parseInt(item.Height);
            this.bookedCargo.push([new MilitaryCargo3({
                id: null,
                TCN: item.TCN,
                cargoStatus : 6,
                billingStatus: null,
                bundleIndex: this.bookedCargo.length,
                bookingId: null,
                bookingNumber: null,
                BOLId: null,
                BOLNumber: null,
                forwarder: new Entity({
                    address: new Account3({
                        accountId: request.Customer.account.accountID ? request.Customer.account.accountID : null,
                        accountName: request.Customer.account.accountName ? request.Customer.account.accountName : null,
                        address1: request.Customer.account.address1 ? request.Customer.account.address1 : null,
                        address2: request.Customer.account.address2 ? request.Customer.account.address2 : null,
                        addressId: request.Customer.account.addressID ? request.Customer.account.addressID : null,
                        addressTypeId: request.Customer.account.addressTypeID ? request.Customer.account.addressTypeID : null,
                        city: request.Customer.account.city ? request.Customer.account.city : null,
                        country: request.Customer.account.country ? request.Customer.account.country : null,
                        state: request.Customer.account.state ? request.Customer.account.state : null,
                        zip: request.Customer.account.zip ? request.Customer.account.zip : null
                    }),
                    contact: new Contact({
                        name: null,
                        email: null,
                        fax: null,
                        phone: null
                    }),
                    DODACC: request.Customer.DODACC ? request.Customer.DODACC : null,
                    name: request.Customer.companyName ? request.Customer.companyName : null
                }),
                consignee: new Entity({
                    address: new Account3({
                        accountId: null,
                        accountName: null,
                        address1: request.EntityInfo.Consignee.Address.Address1 ? request.EntityInfo.Consignee.Address.Address1 : '',
                        address2: request.EntityInfo.Consignee.Address.Address2 ? request.EntityInfo.Consignee.Address.Address2 : '',
                        addressId: null,
                        addressType: null,
                        city: request.EntityInfo.Consignee.Address.City ? request.EntityInfo.Consignee.Address.City : '',
                        country: request.EntityInfo.Consignee.Address.CountryCode ? request.EntityInfo.Consignee.Address.CountryCode : '',
                        state: request.EntityInfo.Consignee.Address.StateCode ? request.EntityInfo.Consignee.Address.StateCode : '',
                        zip: request.EntityInfo.Consignee.Address.PostalCode ? request.EntityInfo.Consignee.Address.PostalCode : '' 
                    }),
                    contact: new Contact({
                        name: request.EntityInfo.Consignee.Contacts[0] ? request.EntityInfo.Consignee.Contacts[0].Name : '',
                        email: request.EntityInfo.Consignee.Contacts[0] ? request.EntityInfo.Consignee.Contacts[0].Email : '',
                        fax: request.EntityInfo.Consignee.Contacts[0] ? request.EntityInfo.Consignee.Contacts[0].Fax : '',
                        phone: request.EntityInfo.Consignee.Contacts[0] ? request.EntityInfo.Consignee.Contacts[0].TelephoneNumber : ''
                    }),
                    DODACC: request.EntityInfo.Consignee.DODACC ? request.EntityInfo.Consignee.DODACC : '',
                    name: request.EntityInfo.Consignee.Name ? request.EntityInfo.Consignee.Name : '' 
                }),
                recdate: null,
                customapprv: null,
                referenceno: null,
                POL: new portSegment({
                    port: new Port3(request.PortInfo.PortOfLoad),
                    vessel: new Vessel3(request.Vessels[0].Vessel),
                    voyageNum: request.Vessels[0].Voyage,
                    ETA: null,
                    actualArrival: null,
                    departingVessel: null,
                    departingVoyageNum: null,
                    ETD: null,
                    actualDeparture: null
                }),
                POD: new portSegment({
                    port: new Port3(request.PortInfo.PortOfDischarge),
                    vessel: new Vessel3(request.Vessels[0].Vessel),
                    voyageNum: request.Vessels[0].Voyage,
                    ETA: null,
                    actualArrival: null,
                    departingVessel: null,
                    departingVoyageNum: null,
                    ETD: null,
                    actualDeparture: null
                }),
                transshipments: [],
                rates: [],
                totalCost: null,
                cargoDescription: item.CargoDescription,
                year: null,
                make: null,
                model: null,
                color: null,
                numAxles: null,
                dims: new Dims({
                    unitOfMeasure: tmpDimsUnit,
                    length: tmpLength,
                    width: tmpWidth,
                    height: tmpHeight,
                    weightUnit: tmpWeightUnit,
                    weight: tmpWeight
                }),
                commodityCode: item.CommodityCode ? item.CommodityCode : null,
                cargoType: tmpCargoType,
                cargoSubType: tmpCargoSubType,
                cargoCondition: null,
                mafi: false,
                hazmat: item.Hazmat ? new MilitaryHazmat({
                    maxTemp: item.Hazmat.MaxTemperture ? item.Hazmat.MaxTemperture : null,
                    packingGroupCode: item.Hazmat.PackingGroupCode ? item.Hazmat.PackingGroupCode : null,
                    tempUnit: item.Hazmat.TempertureUnit ? item.Hazmat.TempertureUnit : null,
                    class: item.Hazmat.class ? item.Hazmat.class : null,
                    code: item.Hazmat.code ? item.Hazmat.code : null,
                    contactNumber: item.Hazmat.contactNumber ? item.Hazmat.contactNumber : null,
                    description: item.Hazmat.description ? item.Hazmat.description : null
                }) : false,
                comments: null,
                internalComments: null,
                isVoid: false
            })]);
        })
    }
}

class Commision {
    constructor(obj) {
        if(obj) {
            this.amount = obj.amount ? obj.amount : null;
            this.unitType = obj.unitType ? obj.unitType : null;
        } else {
            this.amount = null;
            this.unitType = null;
        }
    }
}

class Contact {
    constructor(obj) {
        if(obj) {
            this.name = obj.name ? obj.name : null;
            this.email = obj.email ? obj.email : null;
            this.fax = obj.fax ? obj.fax : null;
            this.phone = obj.phone ? obj.phone : null;
        } else {
            this.name = null;
            this.email = null;
            this.fax = null;
            this.phone = null;
        }
    }
}

class Customer3 {
    constructor(obj) {
        if(obj) {
            this.DODACC = obj.DODACC ? obj.DODACC : null;
            this.FMCNumber = obj.FMCNumber ? obj.FMCNumber : null;
            this.companyName = obj.companyName ? obj.companyName : null;
            this.customerId = obj.customerId ? obj.customerId : null;
            this.customerTypeId = obj.customerTypeId ? obj.customerTypeId : null;
            this.account = obj.account ? new Account3(obj.account) : new Account3();
        } else {
            this.DODACC = null;
            this.FMCNumber = null;
            this.companyName = null;
            this.customerId = null;
            this.customerTypeId = null;
            this.account = new Account3();
        }
    }
}

class Account3 {
    constructor(obj) {
        if(obj) {
            this.accountId = obj.accountId ? obj.accountId : null;
            this.accountName = obj.accountName ? obj.accountName : null;
            this.address1 = obj.address1 ? obj.address1 : null;
            this.address2 = obj.address2 ? obj.address2 : null;
            this.addressId = obj.addressId ? obj.addressId : null;
            this.addressType = obj.addressType ? obj.addressType : null;
            this.addressTypeId = obj.addressTypeId ? obj.addressTypeId : null;
            this.city = obj.city ? obj.city : null;
            this.country = obj.country ? obj.country : null;
            this.state = obj.state ? obj.state : null;
            this.zip = obj.zip ? obj.zip : null;
        } else {
            this.accountId = null;
            this.accountName = null;
            this.address1 = null;
            this.address2 = null;
            this.addressId = null;
            this.addressType = null;
            this.addressTypeId = null;
            this.city = null;
            this.country = null;
            this.state = null;
            this.zip = null;
        }
    }
}

class Port3 {
    constructor(obj) {
        if(obj) {
            this.id = obj.id ? obj.id : null;
            this.CensusCode = obj.CensusCode ? obj.CensusCode : null;
            this.CountryCode = obj.CountryCode ? obj.CountryCode : null;
            this.MilitaryCode = obj.MilitaryCode ? obj.MilitaryCode : null;
            this.Name = obj.Name ? obj.Name : null;
            this.PortCode = obj.PortCode ? obj.PortCode : null;
            this.ShortName = obj.ShortName ? obj.ShortName : null;
            this.UNCode = obj.UNCode ? obj.UNCode : null;
        } else {
            this.id = null;
            this.CensusCode = null;
            this.CountryCode = null;
            this.MilitaryCode = null;
            this.Name = null;
            this.PortCode = null;
            this.ShortName = null;
            this.UNCode = null;
        }
    }
}

class RollLogObj {
    constructor(obj) {
        if(obj) {
            this.ETA = obj.ETA ? obj.ETA : null;
            this.ETD = obj.ETD ? obj.ETD : null;
            this.vessel = obj.vessel ? new Vessel3(obj.vessel) : new Vessel3();
            this.voyageNum = obj.voyageNum ? obj.voyageNum : null;
            this.cargo = obj.cargo ? obj.cargo : null;
        } else {
            this.ETA = null;
            this.ETD = null;
            this.vessel = new Vessel3();
            this.voyageNum = null;
            this.cargo = null;
        }
    }
}

class Vessel3 {
    constructor(obj) {
        if(obj) {
            this.id = obj.id ? obj.id : null;
            this.Code = obj.Code ? obj.Code : null;
            this.IMONumber = obj.IMONumber ? obj.IMONumber : null;
            this.Name = obj.Name ? obj.Name : null;
        } else {
            this.id = null;
            this.Code = null;
            this.IMONumber = null;
            this.Name = null;
        }
    }
}

class SpecialHandlingInstructions {
    constructor(obj) {
        if(obj) {
            this.code = obj.code ? obj.code : '';
            this.name = obj.name ? obj.name : '';
        } else {
            this.code = '';
            this.name = '';
        }
    }
}

class MilitaryHazmat {
    constructor(obj) {
        if(obj) {
            this.maxTemp = obj.maxTemp ? obj.maxTemp : null;
            this.packingGroupCode = obj.packingGroupCode ? obj.packingGroupCode : null;
            this.tempUnit = obj.tempUnit ? obj.tempUnit : null;
            this.class = obj.class ? obj.class : null;
            this.code = obj.code ? obj.code : null;
            this.contactNumber = obj.contactNumber ? obj.contactNumber : null;
            this.description = obj.description ? obj.description : null;
        } else {
            this.maxTemp = null;
            this.packingGroupCode = null;
            this.tempUnit = null;
            this.class = null;
            this.code = null;
            this.contactNumber = null;
            this.description = null;
        }
    }
}

class BillOfLading {
    constructor(obj) {
        if(obj) {
            this.id = obj.id ? obj.id : null;
            this.status = obj.status ? obj.status : null;
            this.BOLNumber = obj.BOLNumber ? obj.BOLNumber : null;
            this.freightTerms = obj.freightTerms ? obj.freightTerms : null;
            this.exportReference = obj.exportReference ? obj.exportReference : null;
            this.carrierBookingRef = obj.carrierBookingRef ? obj.carrierBookingRef : null;
            this.shipper = obj.shipper ? new Entity(obj.shipper) : new Entity();
            this.consignee = obj.consignee ? new Entity(obj.consignee) : new Entity();
            this.notifyParty = obj.notifyParty ? new Entity(obj.notifyParty) : new Entity();
            this.forwarder = obj.forwarder ? new Entity(obj.forwarder) : new Entity();
            this.originCountry = obj.originCountry ? obj.originCountry : null;
            this.domesticRouting = obj.domesticRouting ? obj.domesticRouting : null;
            this.preCarriage = obj.preCarriage ? obj.preCarriage : null;
            this.inlandRouting = obj.inlandRouting ? obj.inlandRouting : null;
            this.vessel = obj.vessel ? new Vessel3(obj.vessel) : new Vessel3();
            this.voyageNum = obj.voyageNum ? obj.voyageNum : null;
            this.POL = obj.POL ? new Port3(obj.POL) : new Port3();
            this.POD = obj.POD ? new Port3(obj.POD) : new Port3();
            this.declarationOfValue = obj.declarationOfValue ? obj.declarationOfValue : null;
            this.payableAt = obj.payableAt ? obj.payableAt : null;
            this.originalBL = obj.originalBL ? obj.originalBL : 0;
            this.sailDate = obj.sailDate ? obj.sailDate : null;
            this.internalComments = obj.internalComments ? obj.internalComments : null;
            this.expressRelease = obj.expressRelease ? obj.expressRelease : false;
            this.totalCargo = obj.totalCargo ? obj.totalCargo : null;
            this.totalWeightKG = obj.totalWeightKG ? obj.totalWeightKG : null;
            this.totalMeasurementCMB = obj.totalMeasurementCMB ? obj.totalMeasurementCMB : null;
            this.totalFreightCollect = obj.totalFreightCollect ? obj.totalFreightCollect : null;
            this.captain = obj.captain ? obj.captain : null;
            this.GRT = obj.GRT ? obj.GRT : null;
            this.NRT = obj.NRT ? obj.NRT : null;
            this.showCBM = obj.showCBM ? obj.showCBM : false;
            this.showWeights = obj.showWeights ? obj.showWeights : false;
            this.showFreightForwarder = obj.showFreightForwarder ? obj.showFreightForwarder : false;
            this.freighted = obj.freighted ? obj.freighted : false;
            this.roundWeight = obj.roundWeight ? obj.roundWeight : 2;
            this.roundCBM = obj.roundCBM ? obj.roundCBM : 2;
            this.approvedBy = obj.approvedBy ? obj.approvedBy : false;
            this.approveDate = obj.approveDate ? obj.approveDate : false;
            this.isVoid = obj.isVoid ? obj.isVoid : false;
            this.isDelete = obj.isDelete ? obj.isDelete : false;
            this.cargo = [];
            obj.cargo.forEach(item => {
                switch(item.customerType){
                    case 'M':
                        this.cargo.push(new MilitaryCargo3(item));
                        break;
                    case 'C':
                        this.cargo.push(new CommercialCargo3(item));
                        break;
                }
            })
            this.cargoRates = [];
            obj.cargoRates.forEach(item => {
                this.cargoRates.push(new Rates(item));
            })
            this.BOLRates = [];
            obj.BOLRates.forEach(item => {
                this.BOLRates.push(new Rates(item));
            })
        } else {
            this.id = null;
            this.status = 1; //Defaulted to BOL Created
            this.BOLNumber = null;
            this.freightTerms = 1; //Defaulted to Prepaid
            this.exportReference = null;
            this.carrierBookingRef = null;
            this.shipper = new Entity();
            this.consignee = new Entity();
            this.notifyParty = new Entity();
            this.forwarder = new Entity();
            this.originCountry = null;
            this.domesticRouting = null;
            this.preCarriage = null;
            this.inlandRouting = null;
            this.vessel = new Vessel3();
            this.voyageNum = null;
            this.POL = new Port3();
            this.POD = new Port3();
            this.declarationOfValue = null;
            this.payableAt = null;
            this.originalBL = 0;
            this.sailDate = null;
            this.internalComments = null;
            this.expressRelease = false;
            this.totalCargo = null;
            this.totalWeightKG = null;
            this.totalMeasurementCMB = null;
            this.totalFreightCollect = null;
            this.captain = null;
            this.GRT = null;
            this.NRT = null;
            this.showCBM = false;
            this.showWeights = false;
            this.showFreightForwarder = false;
            this.freighted = false;
            this.roundWeight = 2;
            this.roundCBM = 2;
            this.cargo = [];
            this.cargoRates = [];
            this.BOLRates = [];
            this.approvedBy = false;
            this.approveDate = false;
            this.isVoid = false;
            this.isDelte = false;
        }
    }
    setTotalRates() {
        this.cargoRates = [];
        //For Each rate in each piece of cargo
        this.cargo.forEach(cargo => {
            cargo.rates.forEach(rate => {
                //Find if any rates in the BOL Object match the rate from the cargo object
                let filteredRates = this.cargoRates.filter(item => {
                    return item.rateType == rate.rateType
                        && item.rate == rate.rate
                        && item.unitType == rate.unitType
                });
                //If no matches are found, push this new rate onto the BOL Object's rate array
                if(filteredRates.length == 0) {
                    this.cargoRates.push(new Rates(rate));
                //Else Incremend the unitTypeAmount to 'add' the rates together
                } else {
                    //W/M Unit Type rates are specific in that they contain a MT/CBM at the end and should also be split
                    if(rate.unitType == 1) {
                        let CBMorMT1 = rate.unitTypeAmount.split(' ')[1];
                        let tmpIndex = filteredRates.findIndex(item => {
                            //Looking for w/m rates
                            if(item.unitType == 1) {
                                let CBMorMT2 = new String(item.unitTypeAmount).split(' ')[1];
                                if(CBMorMT1 == CBMorMT2) {
                                    return item;
                                }
                            }
                        });
                        if(tmpIndex == -1) {
                            this.cargoRates.push(new Rates(rate));
                        } else {
                            let newUnitTypeAmount = `${parseFloat(rate.unitTypeAmount) + parseFloat(filteredRates[tmpIndex].unitTypeAmount)} ${CBMorMT1}`;
                            filteredRates[tmpIndex].unitTypeAmount = newUnitTypeAmount;
                        }
                    } else {
                        filteredRates[0].unitTypeAmount += rate.unitTypeAmount;
                    }
                }
            })
        });
        //Calculating new totals for the rates
        this.cargoRates.forEach(item => {
            item.cost = parseFloat(new String(item.unitTypeAmount).split(' ')[0]) * parseFloat(item.rate);
        })
    }   
}
