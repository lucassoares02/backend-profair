const router = require("express").Router();

const Merchandise = require("@controller/Merchandise");
const Negotiation = require("@controller/Negotiation");
const Provider = require("@controller/Provider");
const Category = require("@controller/Category");
const Request = require("@controller/Request");
const Graphs = require("@controller/Graphs");
const Client = require("@controller/Client");
const Buyer = require("@controller/Buyer");
const Notice = require("@controller/Notice");
const User = require("@controller/User");
const Multishow = require("@controller/Multishow");
const Delete = require("@controller/Delete");
const Faceline = require("@controller/Faceline");
const Wedding = require("@controller/Wedding");
const Log = require("@controller/Log");

router.post("/faceline-user", Log.InsertLog, Faceline.insert);
router.post("/faceline-user-update", Log.InsertLog, Faceline.update);

// Router with the headers
router.post("/getuser", Log.InsertLog,  User.getUser);
router.post("/getusermore", Log.InsertLog, User.getUserDoubleCompany);
router.post("/getuserweb", Log.InsertLog, User.getUserWeb);

router.get("/getallusersorg", Log.InsertLog, User.getAllUsersOrg);
router.get("/getallusersprovider", Log.InsertLog, User.getAllUsersProvider);
router.get("/getprovideruser/:code/:type", Log.InsertLog, User.getProviderUser);
router.get("/getusersprovidernotinlist", Log.InsertLog, User.getUsersProviderNotInList);
router.get("/getallusersassociate", Log.InsertLog, User.getAllUsersAssociate);

router.get("/allclient", Log.InsertLog, Client.getAllClient);
router.get("/client/:codacesso", Log.InsertLog, Client.getOneClient);
router.get("/clientconsult/:codconsultor", Log.InsertLog, Client.getClientConsult);

router.post("/insertperson", Log.InsertLog, Client.postInsertPerson);
router.post("/insertuser", Log.InsertLog, Client.postInsertUser);
router.post("/updateperson", Log.InsertLog, Client.updatePerson);
router.post("/updateusers", Log.InsertLog, Client.updateUsers);
router.post("/inserrelationprovider", Log.InsertLog, Client.insertRelationProviderClient);

router.get("/clientmerchandise/:codmercadoria", Log.InsertLog, Client.getClientMerchandise);
router.get("/clientmerchandisetrading/:codmercadoria/:codnegotiation", Log.InsertLog, Client.getClientMerchandiseTrading);
router.get("/stores/:codconsultor", Log.InsertLog, Client.getStoreConsultant);
router.get("/storescategory/:codprovider", Log.InsertLog, Client.getStoresCategory);
router.get("/stores", Log.InsertLog, Client.getAllStores);
router.get("/storesgraph", Log.InsertLog, Client.getAllStoresGraph);

router.get("/valueminutegraph", Log.InsertLog, Client.getAllStoresGraphHour);

router.get("/valueminutegraphprovider/:codeprovider", Log.InsertLog, Client.getSellGraphHourProvider);

router.get("/valuefair", Log.InsertLog, Client.getValueTotalFair);

router.get("/storesbyprovider/:codprovider", Log.InsertLog, Client.getStoresbyProvider);

router.get("/categoriesconsult/:codconsult", Log.InsertLog, Category.getCategoryConsult);

router.get("/notices", Log.InsertLog, Notice.getAllNotice);
router.get("/schedule", Log.InsertLog, Notice.getAllSchedule);

router.get("/providerclient/:codconsultor", Log.InsertLog, Provider.getProviderClient);

router.get("/suppliersinvoicing", Log.InsertLog, Provider.getProviderSells);
router.get("/companies/:type", Log.InsertLog, Provider.getCompanies);
router.get("/providerscategories/:codbuyer", Log.InsertLog, Provider.getProvidersCategories);
router.get("/providersconsult/:codconsultclient", Log.InsertLog, Provider.getProvidersClient);
router.get("/providerconsult/:codconsult", Log.InsertLog, Provider.getProviderConsult);

router.get("/providerdetails/:codforn", Log.InsertLog, Provider.getProviderDetails);

router.post("/insertprovider", Log.InsertLog, Provider.postInsertProvider);

router.get("/negotiationprovider/:codforn", Log.InsertLog, Negotiation.getNegotiationProvider);
router.get("/negotiationclient/:codclient/:codforn", Log.InsertLog, Negotiation.getNegotiationClient);

router.get("/negotiationproviderclient/:codclient/:codforn", Log.InsertLog, Negotiation.getNegotiationsProviderWithMerchandisePerClient);

router.get("/negotiationclientwithprice/:codclient/:codforn", Log.InsertLog, Negotiation.getNegotiationClientWithPrice);
router.get("/negotiationclientwithpricenotnull/:codclient/:codforn", Log.InsertLog, Negotiation.getNegotiationClientsWithPriceNotNull);

router.post("/insertnegotiation", Log.InsertLog, Negotiation.PostInsertNegotiation);

router.post("/insertnegotiationrelacionamercadoria", Log.InsertLog, Negotiation.PostInsertNegotiationRelacionaMercadoria);

router.get("/exportnegotiations", Log.InsertLog, Negotiation.GetExportNegotiations);

router.get("/exportnegotiationsprovider/:supplier/:buyer/:negotiation", Log.InsertLog, Negotiation.GetExportNegotiationsProvider);

router.get("/exportnegotiationsclient/:codeclient", Log.InsertLog, Negotiation.GetExportNegotiationsClientTesteaaaaaaaaa);

router.get("/exportnegotiationsclientprovider/:codeclient/:codeprovider", Log.InsertLog, Negotiation.GetExportNegotiationsClientPerProvider);
router.get("/exportnegotiationperclient/:codeclient/:codenegotiation", Log.InsertLog, Negotiation.GetExportNegotiationsPerNegotiationClient);
router.get("/exportnegotiationper/:codenegotiation", Log.InsertLog, Negotiation.GetExportNegotiationsPerNegotiation);
router.get("/exportnegotiationperprovider/:codeclient/:codenegotiation", Log.InsertLog, Negotiation.GetExportNegotiationPerProvider);


router.get("/ExportNegotiationsPerProvider/:provider", Log.InsertLog, Negotiation.ExportNegotiationsPerProvider);

router.get("/exportproductnegotiationperprovider/:provider", Log.InsertLog, Negotiation.exportProductsPerNegotiationPerProvider);






router.get("/buyersclient/:codconsultorclient", Log.InsertLog, Buyer.getBuyersClient);

router.get("/buyersprovider/:codprovider", Log.InsertLog, Buyer.getBuyersProvider);

router.get("/buyers", Log.InsertLog, Buyer.getAllBuyers);

router.get("/statusnegotiation", Log.InsertLog, Negotiation.negotiationStatus);
router.get("/statusnegotiation/:code", Log.InsertLog, Negotiation.changeNegotiationStatus);


router.patch("/merchandise/:codMercadoria", Log.InsertLog, Merchandise.patchMerchandise);
router.get("/merchandiseclientprovidernegotiation/:codclient/:codprovider/:codnegotiation", Log.InsertLog, Merchandise.getMerchandiseClientProviderNegotiation);
router.get("/merchandiseprovider/:codprovider", Log.InsertLog, Merchandise.getMerchandiseProvider);
router.get("/merchandiseproviderifclient/:codclient/:codprovider/:codnegotiation", Log.InsertLog, Merchandise.getMerchandiseProviderIfClientLimitNegotiation);
router.get("/merchandiseproviderifclientlimitnegotiation/:codclient/:codprovider/:codnegotiation", Log.InsertLog, Merchandise.getMerchandiseProviderIfClientLimitNegotiation);

router.get("/merchandisenegotiationprovider/:codprovider/:codnegotiation", Log.InsertLog, Merchandise.getMerchandiseNegotiationProvider);
router.get("/merchandisenegotiationproviderifClient/:codprovider/:codnegotiation", Log.InsertLog, Merchandise.getMerchandiseNegotiationProviderIfClient);

router.get("/merchandisepercustomer/:codclient/:codeprovider", Log.InsertLog, Merchandise.getMerchandisePerCustomer);

router.get("/merchandiseperclient/:codclient/:codeprovider/:codenegotiation", Log.InsertLog, Merchandise.getMerchandisePerClient);

router.post("/insertmerchandise", Log.InsertLog, Merchandise.postInsertMerchandise);

router.get("/requestproviderclient/:codclient", Log.InsertLog, Request.getRequestProviderClient);
router.get("/requesttopproviderclient/:codclient", Log.InsertLog, Request.getRequestTopProviderClient);
router.get("/requesttonegotiationclient/:codclient/:codprovider", Log.InsertLog, Request.getRequestNegotiationProviderClient);
router.get("/requesttonegotiationsperprovider/:codprovider", Log.InsertLog, Request.getRequestNegotiationsPerProvider);

router.get("/requestsprovider/:codprovider", Log.InsertLog, Request.getRequestsProvider);
router.get("/exportrequestsprovider/:provider", Log.InsertLog, Request.ExportClientsPerProvider);


router.get("/requestsprovidernegotiation/:codenegotiation", Log.InsertLog, Request.getRequestsNegotiation);

router.get("/requestsnegotiationbyclient/:codebranch", Log.InsertLog, Request.getRequestsClientsWithNegotiation);

router.get("/requestsclients/:codconsult", Log.InsertLog, Request.getRequestsClients);
router.post("/insertrequest", Log.InsertLog, Request.postInsertRequest);

router.post("/insertrequestnew", Log.InsertLog, Request.postInserRequestNew);

router.get("/allrequestclients", Log.InsertLog, Request.getAllRequests);

router.get("/percentageclients/:codprovider", Log.InsertLog, Graphs.getPercentageClients);
router.get("/percentageproviderbyclients/:codbuyer", Log.InsertLog, Graphs.getPercentagePovidersByClients);
router.get("/percentageclientsorganization", Log.InsertLog, Graphs.getPercentageClientsOrganization);
router.get("/percentageprovidersorganization", Log.InsertLog, Graphs.getPercentageProvidersOrganization);
router.get("/totalvalueclients/:codprovider", Log.InsertLog, Graphs.getTotalValueClients);
router.get("/information", Log.InsertLog, Graphs.getTotalInformations);
router.get("/exportpdf/:supplier/:negotiation/:client", Log.InsertLog, Graphs.getExportPdf);

router.get("getnegotiationmultishow/:category", Log.InsertLog, Graphs.getExportPdf);

router.post("/multishow/negotiation", Log.InsertLog, Multishow.getNegotiations);

router.get("/multishow/merchandiserefresh/:product/:negotiation", Log.InsertLog, Multishow.refreshMerchandise);

router.get("/deleteallinformations", Log.InsertLog, Delete.deleteAll);
router.delete("/deletecompanytouser/:company/:user/:type", Log.InsertLog, Delete.deleteCompanyToUser);
router.get("/insertcompanytouser/:company/:user/:type", Log.InsertLog, Provider.insertCompanyToUser);


router.get("/wedding/get", Log.InsertLog, Wedding.get);
router.get("/wedding/confirm", Log.InsertLog, Wedding.confirm);
router.get("/wedding/desconfirm", Log.InsertLog, Wedding.disconfirm);
router.get("/wedding/getallguests", Log.InsertLog, Wedding.getAllGuests);


module.exports = router;
