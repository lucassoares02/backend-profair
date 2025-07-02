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
const Notification = require("@controller/Notification");
const WindowNegotiation = require("@controller/WindowNegotiation");

router.post("/faceline-user", Log.InsertLog, Faceline.insert);
router.post("/faceline-user-update", Log.InsertLog, Faceline.update);

// Router with the headers
router.post("/getuser", Log.InsertLog, User.getUser);
router.post("/getusermore", Log.InsertLog, User.getUserDoubleCompany);
router.post("/getuserweb", Log.InsertLog, User.getUserWeb);

router.get("/getallusersorg", Log.InsertLog, User.getAllUsersOrg);
router.get("/getallusersprovider", Log.InsertLog, User.getAllUsersProvider);
router.get("/getprovideruser/:code/:type", Log.InsertLog, User.getProviderUser);
router.get("/getconsultsprovider/:provider", Log.InsertLog, User.getConsultsProvider);
router.get("/getusersprovidernotinlist", Log.InsertLog, User.getUsersProviderNotInList);
router.get("/getallusersassociate", Log.InsertLog, User.getAllUsersAssociate);

router.get("/allacesso", Log.InsertLog, Client.allAccess);
router.get("/allclient", Log.InsertLog, Client.getAllClient);
router.get("/client/:codacesso", Log.InsertLog, Client.getOneClient);
router.get("/clientconsult/:codconsultor", Log.InsertLog, Client.getClientConsult);

router.get("/checkcodeuser/:code", Log.InsertLog, Client.checkCodeUser);
router.post("/insertperson", Log.InsertLog, Client.postInsertPerson);
router.post("/insertuser", Log.InsertLog, Client.postInsertUser);
router.post("/updateperson", Log.InsertLog, Client.updatePerson);
router.post("/updateusers", Log.InsertLog, Client.updateUsers);
router.post("/inserrelationprovider", Log.InsertLog, Client.insertRelationProviderClient);

router.get("/clientmerchandise/:codmercadoria", Log.InsertLog, Client.getClientMerchandise);
router.get("/clientmerchandisetrading/:codmercadoria/:codnegotiation", Log.InsertLog, Client.getClientMerchandiseTrading);
router.get("/stores/:codconsultor", Log.InsertLog, Client.getStoreConsultant);
router.get("/stores/:user/:consultant_id/:supplier_id", Log.InsertLog, Client.getOneClientNew);
router.get("/storescategory/:codprovider", Log.InsertLog, Client.getStoresCategory);
router.get("/stores", Log.InsertLog, Client.getAllStores);
router.get("/storesgraph", Client.getAllStoresGraph);
router.get("/storesgraphprovider", Client.getAllProvidersGraph);

router.get("/valueminutegraph", Client.getAllStoresGraphHour);
router.get("/graphevolution", Client.getAllStoresGraphEvolution);

router.get("/valueminutegraphprovider/:codeprovider", Log.InsertLog, Client.getSellGraphHourProvider);

router.get("/valuefair", Log.InsertLog, Client.getValueTotalFair);

router.get("/storesbyprovider/:codprovider", Log.InsertLog, Client.getStoresbyProvider);
router.get("/storespresentbyprovider/:codprovider", Log.InsertLog, Client.getStoresPresentbyProvider);

router.get("/categoriesconsult/:codconsult", Log.InsertLog, Category.getCategoryConsult);

router.get("/notices", Log.InsertLog, Notice.getAllNotice);
router.get("/schedule", Log.InsertLog, Notice.getAllSchedule);

router.get("/providerclient/:codconsultor", Log.InsertLog, Provider.getProviderClient);

router.get("/suppliersinvoicing", Log.InsertLog, Provider.getProviderSells);
router.post("/updatedetailsprovider", Log.InsertLog, Provider.updateProviderImageAndColor);
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
router.get("/merchandisetoptenprovider/:codprovider", Log.InsertLog, Merchandise.getTopTenMerchandiseProvider);
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
router.get("/requestsnegotiationclientororg/:client/:provider", Log.InsertLog, Request.getRequestsClientsOrOrg);

router.get("/requestsclients/:codconsult", Log.InsertLog, Request.getRequestsClients);
router.post("/insertrequest", Log.InsertLog, Request.postInsertRequest);

router.post("/insertrequestnew", Log.InsertLog, Request.postInserRequestNew);

router.get("/allrequestclients", Log.InsertLog, Request.getAllRequests);

router.get("/percentageclients/:codprovider", Log.InsertLog, Graphs.getPercentageClients);
router.get("/percentageproviderbyclients/:codbuyer", Log.InsertLog, Graphs.getPercentagePovidersByClients);
router.get("/percentageclientsorganization", Log.InsertLog, Graphs.getPercentageClientsOrganization);
router.get("/percentageprovidersorganization", Log.InsertLog, Graphs.getPercentageProvidersOrganization);
router.get("/totalvalueclients/:codprovider", Log.InsertLog, Graphs.getTotalValueClients);
router.get("/information", Graphs.getTotalInformations);
router.get("/exportpdf/:supplier/:negotiation/:client", Log.InsertLog, Graphs.getExportPdf);
router.get("/exportpdfgpt/:supplier/:negotiation/:client", Log.InsertLog, Graphs.getExportPdfTesteLayoutGpt);
router.get("/exportpdfdeep/:supplier/:negotiation/:client", Log.InsertLog, Graphs.getExportPdfTesteLayoutDeep);

router.get("getnegotiationmultishow/:category", Log.InsertLog, Graphs.getExportPdf);

router.post("/multishow/negotiation", Log.InsertLog, Multishow.getNegotiations);
router.post("/multishow/negotiation/disabled", Log.InsertLog, Multishow.getNegotiationsDisabled);
router.post("/multishow/negotiation/out/adega", Log.InsertLog, Multishow.getNegotiationsOutAdega);
router.get("/multishow/merchandiserefresh/:product/:negotiation", Log.InsertLog, Multishow.refreshMerchandise);
router.get("/multishow/getquerypreevent", Log.InsertLog, Multishow.getQueryPreEvent);
router.get("/multishow/getqueryposevent", Log.InsertLog, Multishow.getQueryPosEvent);
router.get("/multishow/pre/outside", Log.InsertLog, Multishow.getQueryPreOutside);
router.get("/multishow/pre/inside", Log.InsertLog, Multishow.getQueryPreInside);
router.get("/multishow/pos/outside", Log.InsertLog, Multishow.getQueryPosOutiside);
router.get("/multishow/pos/inside", Log.InsertLog, Multishow.getQueryPosInside);

router.get("/deleteallinformations", Log.InsertLog, Delete.deleteAll);
router.delete("/deletecompanytouser/:company/:user/:type", Log.InsertLog, Delete.deleteCompanyToUser);
router.get("/insertcompanytouser/:company/:user/:type", Log.InsertLog, Provider.insertCompanyToUser);


router.get("/wedding/get", Log.InsertLog, Wedding.get);
router.get("/wedding/confirm", Log.InsertLog, Wedding.confirm);
router.get("/wedding/desconfirm", Log.InsertLog, Wedding.disconfirm);
router.get("/wedding/getallguests", Log.InsertLog, Wedding.getAllGuests);

router.get("/getwindownegotiations/:client", Log.InsertLog, WindowNegotiation.getWindowNegotiation);

router.get("/notifications", Log.InsertLog, Notification.getNotifications);
router.post("/notification", Log.InsertLog, Notification.insertNotification);
router.patch("/notification", Log.InsertLog, Notification.updateNotification);
router.post("/notification/send", Log.InsertLog, Notification.sendNotification);
router.post("/notification/opened", Log.InsertLog, Notification.openedNotification);
router.post("/notification/save/token", Log.InsertLog, Notification.saveTokenNotification);
router.post("/notification/targets/:notification", Log.InsertLog, Notification.getTargetsNotifications);


module.exports = router;
