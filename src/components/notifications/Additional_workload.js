import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  NativeBaseProvider,
  Box,
  Center,
  Button,
  Text,
  ScrollView,
  Stack,
  HStack,
  Divider, 
  Modal
} from "native-base";
import { Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { backendUrl } from "../../utils/backendUrl";
import { useSelector, useDispatch } from "react-redux";
import { setNotificationCount } from "../../redux/slice/notificationSlice";
import {useNavigation} from '@react-navigation/native';
import { setForceSync } from "../../redux/slice/autoSyncSlice";
import { setAdditionalWorkloadData } from "../../redux/slice/additionalWorkloadSlice";
export default function Additional_workload() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user_id);
  const notificationCount = useSelector((state) => state.notification.count);
  const currentDateValue = useSelector((state) => state.currentDate.currentDateValue) || new Date().toISOString().split('T')[0] ;
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const additionalWorkloadInfo11= useSelector((state) => state.additionalWorkloadInfo.currentAdditionalWorkloadInfo);
  // console.log(userId);
  // console.log(additionalWorkloadInfo11.length);
  const DisplayData = async() => {
    if (userId && additionalWorkloadInfo11 && additionalWorkloadInfo11.length ===0 ) {
      await axios
        .get(backendUrl + `SellerMainScreen/getadditionalwork/${userId}`)
        .then((res) => {
          // console.log("API DATA",res.data.data);
          // setData(res.data.data);
          if(res.data.data && res.data.data.length >0){
            setData(res.data.data);
          dispatch(setAdditionalWorkloadData(res.data.data));
          }
        })
        .catch((error) => {
          console.log("Additional_Workload/DisplayData/Error Msg1:", error);
        });
    }else{
      setData(additionalWorkloadInfo11);
    }
  };
  useEffect(() => {
    DisplayData();
    dispatch(setNotificationCount(0));
  }, []);
  useEffect(() => {
    setData(additionalWorkloadInfo11);
  }, [additionalWorkloadInfo11]);

  const AcceptHandler = async (consignorCodeAccept, stopId, tripId) => {
    // console.log('df')
    console.log("Additional_Workload/AcceptHandler",{consignorCode: consignorCodeAccept,
      feUserId: userId,
      stopId: stopId,
      tripID: tripId})
    axios
      .post(backendUrl + "SellerMainScreen/acceptWorkLoad", {
        consignorCode: consignorCodeAccept,
        feUserId: userId,
        stopId: stopId,
        tripID: tripId
      })
      .then((response) => {
        console.log("Additional_Workload/AcceptHandler/Msg Accepted ", response.data,'',userId);
        dispatch(setNotificationCount(notificationCount - 1));
        dispatch(setForceSync(true));
        const updatedData = data.filter(item => item.consignorCode !== consignorCodeAccept);
        setData(updatedData);
        dispatch(setAdditionalWorkloadData(updatedData));
        console.log("Additional_Workload/AcceptHandler/Data ", data.length + " ", consignorCodeAccept);
      })
      .catch((error) => {
        console.log("Additional_Workload/AcceptHandler/",error);
      });
  }; 

  const RejectHandler = async (consignorCodeReject, stopId, tripId) => {
    // console.log('df')
    axios
      .post(backendUrl + "SellerMainScreen/rejectWorkLoad", {
        consignorCode: consignorCodeReject,
        feUserId: userId,
        stopId:stopId,
        tripID:tripId
      })
      .then((response) => {
        console.log("Additional_Workload/RejectHandler/Msg Rejected ", response.data);
        dispatch(setNotificationCount(notificationCount - 1));
        const updatedData = data.filter(item => item.consignorCode !== consignorCodeReject);
        setData(updatedData);
        dispatch(setAdditionalWorkloadData(updatedData));

      })
      .catch((error) => {
        console.log("Additional_Workload/RejectHandler/",error);
      });
  };
 
  return (
    <NativeBaseProvider>
      <ScrollView>
        <Box flex={1} bg="coolGray.100" p={4}>
          {data && data.length
            ? data.map((d, i) => {
                return (
                  <Box
                    key={i}
                    width="100%"
                    marginBottom="5"
                    alignItems="center"
                  >
                    <Box
                      width="100%"
                      rounded="lg"
                      overflow="hidden"
                      borderColor="coolGray.100"
                      borderWidth="1"
                      _dark={{
                        borderColor: "coolGray.600",
                        backgroundColor: "white",
                      }}
                      _web={{
                        shadow: 2,
                        borderWidth: 0,
                      }}
                      _light={{
                        backgroundColor: "white",
                      }}
                    >
                      <Stack p="4" space={3}>
                        <HStack
                          alignItems="center"
                          space={4}
                          justifyContent="space-between"
                        >
                          <HStack alignItems="center">
                            <Text
                              color="black"
                              _dark={{
                                color: "gray.400",
                              }}
                              fontWeight="400"
                            >
                              {d.consignorName} {d.consignorCode}
                            </Text>
                          </HStack>
                          <HStack alignItems="center">
                            <Text
                              color="black"
                              _dark={{
                                color: "gray.400",
                              }}
                              fontWeight="400"
                            >
                              {d.ForwardPickups}
                            </Text>
                          </HStack>
                        </HStack>
                        <Divider
                          my="1"
                          _light={{
                            bg: "muted.200",
                          }}
                          _dark={{
                            bg: "muted.50",
                          }}
                        />
                        <Stack space={2}>
                          <Text
                            fontSize="sm"
                            _light={{
                              color: "black",
                            }}
                            _dark={{
                              color: "black",
                            }}
                            fontWeight="500"
                            ml="-0.5"
                            mt="-1"
                          >
                            {d.consignorAddress1} {d.consignorAddress2}
                            {"\n"}
                            {d.consignorCity} - {d.consignorPincode}
                          </Text>
                        </Stack>
                        <Divider
                          my="1"
                          _light={{
                            bg: "muted.200",
                          }}
                          _dark={{
                            bg: "muted.50",
                          }}
                        />
                        <HStack
                          alignItems="center"
                          space={4}
                          justifyContent="space-between"
                        >
                          <HStack alignItems="center">
                            <TouchableOpacity onPress={() => RejectHandler(d.consignorCode, d.stopId, d.FMtripId)}>
                              <Button
                                style={{ backgroundColor: "#FF2E2E" }}
                                _dark={{
                                  color: "red.200",
                                }}
                                fontWeight="400"
                              >
                                Reject
                              </Button>
                            </TouchableOpacity>
                          </HStack>
                          <HStack alignItems="center">
                            <TouchableOpacity onPress={() => AcceptHandler(d.consignorCode, d.stopId, d.FMtripId)}>
                              <Button
                                style={{ backgroundColor: "#004aad" }}
                                _dark={{
                                  color: "blue.200",
                                }}
                                fontWeight="400"
                              >
                                Accept
                              </Button>
                            </TouchableOpacity>
                          </HStack>
                        </HStack>
                      </Stack>
                    </Box>
                  </Box>
                );
              })
            : 
            <Box
            width="100%"
            rounded="lg"
            overflow="hidden"
            borderColor="coolGray.100"
            borderWidth="1"
            _dark={{
              borderColor: "coolGray.600",
              backgroundColor: "white",
            }}
            _web={{
              shadow: 2,
              borderWidth: 0,
            }}
            _light={{
              backgroundColor: "white",
            }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Stack p="4" space={3} textAlign="center"> 
              <HStack
                alignItems="center"
                space={4}
                justifyContent="center" 
              >
                <HStack alignItems="center">
                  <Text
                    color="black"
                    _dark={{
                      color: "gray.400",
                    }}
                    fontWeight="500"
                  >
                    No new notification
                  </Text>
                </HStack>
              </HStack>
             
              <Stack space={2}>
                <Text
                  fontSize="sm"
                  _light={{
                    color: "black",
                  }}
                  _dark={{
                    color: "black",
                  }}
                  fontWeight="400"
                  ml="-0.5"
                  mt="-1"
                >
                  We will notify you when something arrives
                </Text>
              </Stack>
             
              <HStack
                alignItems="center"
                space={4}
                justifyContent="center" 
              >
                <HStack alignItems="center">
                  <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Button
                      style={{ backgroundColor: "#004aad" }}
                      _dark={{
                        color: "blue.200",
                      }}
                      fontWeight="400"
                    >
                      Go to HomeScreen
                    </Button>
                  </TouchableOpacity>
                </HStack>
              </HStack>
            </Stack>
          </Box>
          

          }

          <Center>
            <Image
              style={{ width: 150, height: 100 }}
              source={require("../../assets/image.png")}
              alt={"Logo Image"}
            />
          </Center>
        </Box>
      </ScrollView>
    </NativeBaseProvider>
  );
}
