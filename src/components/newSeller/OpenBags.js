/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  NativeBaseProvider,
  Box,
  Image,
  Center,
  Button,
  Modal,
  Input,
} from "native-base";
import {
  StyleSheet,
  ScrollView,
  View,
  ToastAndroid,
  Vibration,
  TouchableOpacity,
} from "react-native";
import { DataTable, Searchbar, Text, Card } from "react-native-paper";
import { openDatabase } from "react-native-sqlite-storage";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNBeep from "react-native-a-beep";
import { useDispatch, useSelector } from "react-redux";
import GetLocation from "react-native-get-location";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import axios from "axios";
const db = openDatabase({ name: "rn_sqlite" });
import { backendUrl } from "../../utils/backendUrl";
import { setAutoSync } from "../../redux/slice/autoSyncSlice";
import { getAuthorizedHeaders } from "../../utils/headers";

const OpenBags = ({ route }) => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user_id);
  const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);

  const [data, setData] = useState([]);
  const navigation = useNavigation();
  const [showCloseBagModal, setShowCloseBagModal] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [consignorNames, setconsignorNames] = useState("");
  const [stopId, setstopId] = useState("");
  const [token, setToken] = useState(route.params.token);
  const [NoShipment, setNoShipment] = useState(45);
  const [bagSeal, setBagSeal] = useState("");
  const [totalAccepted, setTotalAccepted] = useState(0);
  const [totalShipment, setTotalShipment] = useState(0);
  const [acceptedItemData, setAcceptedItemData] = useState(
    route.params.allCloseBAgData || {}
  );
  const currentDateValue =
    useSelector((state) => state.currentDate.currentDateValue) ||
    new Date().toISOString().split("T")[0];
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [acceptedHandoverStatus, setAcceptedHandoverStatus] = useState([]);
  const [runSheetNumbers, setRunSheetNumbers] = useState([]);
  var check = acceptedItemData;
  const currentDate = new Date().toISOString().slice(0, 10);
  const loadDetails = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM SyncSellerPickUp WHERE FMtripId = ?",
        [route.params.tripID],
        (tx1, results) => {
          let temp = [];
          // console.log(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          setData(temp);
          // console.log(data[0].ShipmentListArray.split().length, "data");
        }
      );
    });
  };

  useEffect(() => {
    (async () => {
      loadDetails();
    })();
  }, []);

  const searched = (keyword1) => (c) => {
    let f = c.consignorName;
    return f.includes(keyword1);
  };

  function CloseBag() {
    console.log("OpenBags.jsCloseBag", bagId);
    console.log("OpenBags.jsCloseBag", bagSeal);
    setBagId("");
    setBagIdNo(bagIdNo + 1);
  }

  const onSuccess11 = (e) => {
    Vibration.vibrate(100);
    RNBeep.beep();
    // console.log(e.data, "sealID");
    // getCategories(e.data);
    setBagSeal(e.data);
  };

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetchTableData();
  }, [acceptedItemData]);
  useEffect(() => {
    // const saveAcceptedItemData = async () => {
    // try {
    AsyncStorage.setItem("acceptedItemData", JSON.stringify(acceptedItemData));
    // } catch (error) {
    // console.log("aaaa", acceptedItemData);
    // }
    // };

    // saveAcceptedItemData();
  }, [acceptedItemData]);

  const fetchTableData = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM closeHandoverBag1", [], (tx, results) => {
        const len = results.rows.length;
        const rows11 = [];

        for (let i = 0; i < len; i++) {
          // const row = results.rows.item(i);
          // const shipmentsCount = JSON.parse(row.acceptedbarcode).length;
          rows11.push({
            consignorName: results.rows.item(i).consignorName,
            shipmentsCount: JSON.parse(results.rows.item(i).AcceptedList)
              .length,
            bagId11: results.rows.item(i).bagId,
          });
        }
        // console.log(JSON.stringify(rows11, null, 4));
        setTableData(rows11);
      });
    });
  };
  useEffect(() => {
    fetchTableData();
    // console.log("fdfdd11 ", acceptedItemData);
  }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setAutoSync(false));
      loadDetails112();
      // loadAcceptedItemData12();
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);
  useEffect(() => {
    loadDetails112();
    // loadAcceptedItemData12();
  }, []);

  const loadDetails112 = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE FMtripId = ? AND  shipmentAction="Seller Delivery"  AND handoverStatus IS NOT NULL',
        [route.params.tripID],
        (tx1, results) => {
          setTotalAccepted(results.rows.length);
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE FMtripId = ? AND  shipmentAction="Seller Delivery" ',
        [route.params.tripID],
        (tx1, results) => {
          setTotalShipment(results.rows.length);
        }
      );
    });
  };

  function CloseBag(consCode) {
    var consName = acceptedItemData[stopId].consignorName;
    // console.log(bagSeal);
    // console.log(acceptedArray);
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM SyncSellerPickUp WHERE FMtripId = ? AND stopId=?  ",
        [route.params.tripID, consCode],
        (tx1, resultsCC) => {
          // console.log(resultsCC.rows.item(0).consignorCode);
          tx.executeSql(
            "SELECT * FROM closeHandoverBag1 Where stopId=? AND bagDate=? ",
            [consCode, currentDate],
            (tx, results) => {
              // console.log(results.rows.length);
              // console.log(results);
              tx.executeSql(
                "INSERT INTO closeHandoverBag1 (bagSeal, bagId, bagDate, AcceptedList,status,consignorCode,stopId,consignorName) VALUES (?, ?, ?,?, ?,?,?,?)",
                [
                  bagSeal,
                  consCode +
                    "-" +
                    currentDate +
                    "-" +
                    (results.rows.length + 1),
                  currentDate,
                  JSON.stringify(acceptedItemData[consCode].acceptedItems11),
                  "pending",
                  resultsCC.rows.item(0).consignorCode,
                  consCode,
                  consName,
                ],
                (tx, results11) => {
                  // console.log("Row inserted successfully");
                  // setAcceptedArray([]);
                  // acceptedItemData[consCode] = null;
                  setAcceptedItemData(
                    Object.fromEntries(
                      Object.entries(acceptedItemData).filter(
                        ([k, v]) => k !== consCode
                      )
                    )
                  );
                  setBagSeal("");
                  console.log(
                    " OpenBags.jsCloseBags Data Added to local db successfully Handover closeBag"
                  );
                  ToastAndroid.show(
                    "Bag closed successfully",
                    ToastAndroid.SHORT
                  );
                  // console.log(results11);
                  viewDetailBag();
                },
                (error) => {
                  console.log(
                    "OpenBags.jsCloseBags Error occurred while inserting a row:",
                    error
                  );
                }
              );
            },
            (error) => {
              console.log(
                "OpenBags.jsCloseBags Error occurred while generating a unique bag ID:",
                error
              );
            }
          );
        }
      );
    });
  }

  const viewDetailBag = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM closeHandoverBag1", [], (tx1, results) => {
        let temp = [];
        // console.log(results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        console.log(
          "OpenBags.jsViewBagsDetails Data from Local Database Handover Bag: \n ",
          JSON.stringify(temp, null, 4)
        );
      });
    });
  };

  useEffect(() => {
    current_location();
  }, []);

  const current_location = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })
      .then((location) => {
        setLatitude(location.latitude);
        setLongitude(location.longitude);
      })
      .catch((error) => {
        // RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        //   interval: 10000,
        //   fastInterval: 5000,
        // })
        //   .then((status) => {
        //     if (status) {
        //       console.log("Location enabled");
        //     }
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
        console.log(
          "OpenBags.jsCurrentLocation Location Lat long error",
          error
        );
      });
  };

  useEffect(() => {
    getAllConsignors();
  }, []);

  function getAllAcceptedHandovers(stopId) {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE FMtripId = ? AND  shipmentAction="Seller Delivery" And stopId=?',
        [route.params.tripID, stopId],
        (tx1, results) => {
          let exp = results.rows.length;
          let acc = 0;
          const tempRunsheetArray = [...runSheetNumbers];
          for (var i = 0; i < results.rows.length; i++) {
            if (results.rows.item(i).handoverStatus == "accepted") {
              acc++;
              if (
                !tempRunsheetArray.includes(results.rows.item(i).runSheetNumber)
              ) {
                tempRunsheetArray.push(results.rows.item(i).runSheetNumber);
              }
            }
          }
          if (exp == acc && exp !== 0) {
            const consignorData = {
              expected: exp,
              accepted: acc,
              rejected: 0,
              consignorCode: stopId,
              rejectReason: "",
            };
            const tempHandoverStatus = [...acceptedHandoverStatus];
            const conIndex = tempHandoverStatus.findIndex(
              (obj) => obj.consignorCode === stopId
            );
            if (conIndex != -1) {
              tempHandoverStatus[conIndex] = consignorData;
            } else {
              tempHandoverStatus.push(consignorData);
            }
            setAcceptedHandoverStatus(tempHandoverStatus);
            setRunSheetNumbers(tempRunsheetArray);
          }
        }
      );
    });
  }
  //  console.log(acceptedHandoverStatus);
  function getAllConsignors() {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM SyncSellerPickUp WHERE FMtripId = ?",
        [route.params.tripID],
        (tx1, results) => {
          for (var i = 0; i < results.rows.length; i++) {
            getAllAcceptedHandovers(results.rows.item(i).stopId);
          }
        }
      );
    });
  }

  function closeHandover() {
    let time11 = new Date().valueOf();
    console.log("OpenBags.jscloseHandover ===handover close data===", {
      handoverStatus: acceptedHandoverStatus,
      runsheets: runSheetNumbers,
      feUserID: userId,
      receivingTime: parseInt(time11),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });
    axios
      .post(
        backendUrl + "SellerMainScreen/closeHandover",
        {
          handoverStatus: acceptedHandoverStatus,
          runsheets: runSheetNumbers,
          feUserID: userId,
          receivingTime: parseInt(time11),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        { headers: getAuthorizedHeaders(token) }
      )
      .then((response) => {
        navigation.navigate("HandOverSummary", {
          tripID: route.params.tripID,
          token: token,
        });
        ToastAndroid.show("Successfully Handover Closed", ToastAndroid.SHORT);
      })
      .catch((error) => {
        ToastAndroid.show("Something Went Wrong", ToastAndroid.SHORT);
        console.error("Error:", error);
      });
  }

  return (
    <NativeBaseProvider>
      <Modal
        isOpen={showCloseBagModal}
        onClose={() => setShowCloseBagModal(false)}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Close Bag</Modal.Header>
          <Modal.Body>
            <QRCodeScanner
              onRead={onSuccess11}
              reactivate={true}
              // showMarker={true}
              reactivateTimeout={2000}
              flashMode={RNCamera.Constants.FlashMode.off}
              ref={(node) => {
                this.scanner = node;
              }}
              containerStyle={{ height: 116, marginBottom: "55%" }}
              cameraStyle={{
                height: 90,
                marginTop: 95,
                marginBottom: "15%",
                width: 289,
                alignSelf: "center",
                justifyContent: "center",
              }}
            />{" "}
            {"\n"}
            <Input
              placeholder="Enter Bag Seal"
              size="md"
              value={bagSeal}
              onChangeText={(text) => setBagSeal(text)}
              style={{
                width: 290,
                backgroundColor: "white",
              }}
            />
            {/* {'\n'}
            <Input placeholder="Enter Bag Seal" size="md" onChangeText={(text)=>setBagSeal(text)} /> */}
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              onPress={() => {
                CloseBag(stopId);
                setShowCloseBagModal(false);
              }}
            >
              Submit
            </Button>
            <View style={{ alignItems: "center", marginTop: 15 }}>
              <View
                style={{
                  width: "98%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: "lightgray",
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  padding: 10,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "500", color: "black" }}
                >
                  Seller Code
                </Text>
                {data && data.length ? (
                  <Text
                    style={{ fontSize: 16, fontWeight: "500", color: "black" }}
                  >
                    {stopId}
                  </Text>
                ) : null}
                {/* <Text style={{fontSize: 16, fontWeight: '500', color : 'black'}}>{sellerCode11}</Text> */}
              </View>
              <View
                style={{
                  width: "98%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: "lightgray",
                  padding: 10,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "500", color: "black" }}
                >
                  Seller Name
                </Text>
                {data && data.length ? (
                  <Text
                    style={{ fontSize: 16, fontWeight: "500", color: "black" }}
                  >
                    {data && stopId && acceptedItemData[stopId]
                      ? acceptedItemData[stopId].consignorName
                      : null}
                  </Text>
                ) : null}
              </View>
              <View
                style={{
                  width: "98%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderBottomWidth: 1,
                  borderColor: "lightgray",
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  padding: 10,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "500", color: "black" }}
                >
                  Number of Shipments
                </Text>
                {data && data.length ? (
                  <Text
                    style={{ fontSize: 16, fontWeight: "500", color: "black" }}
                  >
                    {data &&
                    stopId &&
                    acceptedItemData[stopId] &&
                    acceptedItemData[stopId].acceptedItems11.length > 0
                      ? acceptedItemData[stopId].acceptedItems11.length
                      : null}
                  </Text>
                ) : null}
              </View>
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <Box flex={1} bg="#fff" width="auto" maxWidth="100%">
        <ScrollView
          style={styles.homepage}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={false}
        >
          <Card>
            <DataTable>
              <DataTable.Header
                style={{
                  height: "auto",
                  backgroundColor: "#004aad",
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                }}
              >
                <DataTable.Title style={{ flex: 1.2 }}>
                  <Text style={{ textAlign: "center", color: "white" }}>
                    Seller Name
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ flex: 1.2 }}>
                  <Text style={{ textAlign: "center", color: "white" }}>
                    No. of Shipment
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ flex: 0.8, paddingLeft: 10 }}>
                  <Text style={{ textAlign: "center", color: "white" }}>
                    Bag Status
                  </Text>
                </DataTable.Title>
              </DataTable.Header>
              {acceptedItemData &&
                Object.entries(acceptedItemData).map(([key, value]) => (
                  <DataTable.Row key={key}>
                    <DataTable.Cell style={{ flex: 1.7 }}>
                      <Text style={styles.fontvalue}>
                        {value.consignorName}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }}>
                      {/* <Text style={styles.fontvalue}>{data[0].ShipmentListArray.split().length}</Text> */}
                      <Text style={styles.fontvalue}>
                        {value.acceptedItems11.length}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }}>
                      <Button
                        // disabled={single.BagOpenClose === 'close' ? true : false}
                        // style={{backgroundColor: single.BagOpenClose === 'close' ? 'grey' : '#004aad', color: '#fff'}}
                        style={{ backgroundColor: "#004aad", color: "#fff" }}
                        onPress={() => {
                          setShowCloseBagModal(true);
                          setstopId(key);
                        }}
                      >
                        Close Bag
                      </Button>
                    </DataTable.Cell>
                    {/* <DataTable.Cell style={{flex: 1}}><Button style={{backgroundColor:'#004aad', color:'#fff'}} onPress={
                  () => {navigation.navigate('PendingHandover',{consignorName:single.consignorName,expected:single.ReverseDeliveries})}
                  }>Close Bag</Button></DataTable.Cell> */}
                  </DataTable.Row>
                ))}

              {tableData && tableData.length > 0
                ? tableData.filter(searched(keyword)).map((single, i) => (
                    <DataTable.Row key={single.bagId11}>
                      <DataTable.Cell style={{ flex: 1.7 }}>
                        <Text style={styles.fontvalue}>
                          {single.consignorName}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ flex: 1 }}>
                        {/* <Text style={styles.fontvalue}>{data[0].ShipmentListArray.split().length}</Text> */}
                        <Text style={styles.fontvalue}>
                          {single.shipmentsCount}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell
                        style={{
                          flex: 1,
                          backgroundColor: "lightgrey",
                          padding: 5,
                          margin: 10,
                        }}
                      >
                        <TouchableOpacity
                          style={{ color: "black" }}
                          onPress={() => {
                            ToastAndroid.show(
                              "Bag already closed",
                              ToastAndroid.SHORT
                            );
                          }}
                        >
                          <Center>
                            <Text>Closed Bag</Text>
                          </Center>
                        </TouchableOpacity>
                      </DataTable.Cell>
                      {/* <DataTable.Cell style={{flex: 1}}><Button style={{backgroundColor:'#004aad', color:'#fff'}} onPress={
                  () => {navigation.navigate('PendingHandover',{consignorName:single.consignorName,expected:single.ReverseDeliveries})}
                  }>Close Bag</Button></DataTable.Cell> */}
                    </DataTable.Row>
                  ))
                : null}
            </DataTable>
            {(tableData && tableData.length > 0) ||
            Object.keys(acceptedItemData).length > 0 ? null : (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignText: "center",
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 16 }}>No Bags Created By you</Text>
              </View>
            )}
          </Card>
        </ScrollView>
        {totalAccepted === totalShipment &&
        totalAccepted + totalShipment > 0 &&
        Object.keys(acceptedItemData).length === 0 ? (
          <View
            style={{
              width: "90%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignSelf: "center",
              marginTop: 10,
            }}
          >
            <Button
              w="48%"
              size="lg"
              bg="gray.300"
              onPress={() => {
                // navigation.navigate('PendingHandover',{consignorName:"single.consignorName",expected:"0"})
                ToastAndroid.show("No Pending Shipments", ToastAndroid.SHORT);
              }}
            >
              Pending Handover
            </Button>
            <Button
              w="48%"
              size="lg"
              bg="#004aad"
              onPress={() => closeHandover()}
            >
              Close Handover
            </Button>
          </View>
        ) : (
          <View
            style={{
              width: "90%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignSelf: "center",
              marginTop: 10,
            }}
          >
            <Button
              w="48%"
              size="lg"
              bg={
                Object.keys(acceptedItemData).length === 0
                  ? "#004aad"
                  : "gray.300"
              }
              onPress={
                Object.keys(acceptedItemData).length === 0
                  ? () => {
                      navigation.navigate("PendingHandover", {
                        consignorName: "consignorName",
                        expected: "0",
                        acceptedHandoverStatus: acceptedHandoverStatus,
                        tripID: route.params.tripID,
                        token: token,
                      });
                    }
                  : () =>
                      ToastAndroid.show(
                        "All Bags are not Closed",
                        ToastAndroid.SHORT
                      )
              }
            >
              Pending Handover
            </Button>
            <Button
              w="48%"
              size="lg"
              bg="gray.300"
              onPress={() => {
                // navigation.navigate('HandOverSummary')
                ToastAndroid.show(
                  "All Shipments Not Scanned",
                  ToastAndroid.SHORT
                );
              }}
            >
              Close Handover
            </Button>
          </View>
        )}
        <Center>
          <Image
            style={{ width: 150, height: 150 }}
            source={require("../../assets/image.png")}
            alt={"Logo Image"}
          />
        </Center>
      </Box>
    </NativeBaseProvider>
  );
};
export default OpenBags;
export const styles = StyleSheet.create({
  container112: {
    justifyContent: "center",
  },
  tableHeader: {
    backgroundColor: "#004aad",
    alignItems: "flex-start",
    fontFamily: "open sans",
    fontSize: 15,
    color: "white",
    margin: 1,
  },
  container222: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.2 )",
  },
  normal: {
    fontFamily: "open sans",
    fontWeight: "normal",
    color: "#eee",
    marginTop: 27,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: "#eee",
    width: "auto",
    borderRadius: 0,
    alignContent: "space-between",
  },
  text: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
    justifyContent: "space-between",
    paddingLeft: 20,
  },
  main: {
    backgroundColor: "#004aad",
    width: "auto",
    height: "auto",
    margin: 1,
  },
  textbox: {
    alignItems: "flex-start",
    fontFamily: "open sans",
    fontSize: 13,
    color: "#fff",
  },
  homepage: {
    margin: 10,
    // backgroundColor:"blue",
  },
  mainbox: {
    width: "98%",
    height: 40,
    backgroundColor: "lightblue",
    alignSelf: "center",
    marginVertical: 15,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 1,
  },
  innerup: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "blue",
  },
  innerdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fontvalue: {
    fontWeight: "300",
    flex: 1,
    fontFamily: "open sans",
    justifyContent: "center",
  },
  fontvalue1: {
    fontWeight: "700",
    marginTop: 10,
    marginLeft: 100,
    marginRight: -10,
  },
  searchbar: {
    width: "95%",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  bt1: {
    fontFamily: "open sans",
    fontSize: 15,
    lineHeight: 0,
    marginTop: 0,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#004aad",
    width: 110,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 15,
    marginVertical: 0,
  },
  bt2: {
    fontFamily: "open sans",
    fontSize: 15,
    lineHeight: 0,
    marginTop: -45,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#004aad",
    width: 110,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 235,
    marginVertical: 0,
  },
  btnText: {
    alignSelf: "center",
    color: "#fff",
    fontSize: 15,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 0,
  },
});
