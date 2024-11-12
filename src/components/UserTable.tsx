import DeleteUserModal from "@/components/DeleteUserModal";
import HeaderComponent from "@/components/HeaderComponent";
import PageSizeSelector from "@/components/PageSelector";
import { FormContextType, SORT, Status } from "@/utils/app.constant";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { DataType, SortDirection } from "ka-table/enums";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import glass from "../../public/images/empty_hourglass.svg";
import KaTableComponent from "../components/KaTableComponent";
import Loader from "../components/Loader";
import { deleteUser } from "../services/DeleteUser";
import { getCohortList } from "../services/GetCohortList";
import {
  userList,
  getUserDetailsInfo,
  cohortMemberList,
} from "../services/UserList";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { Role, apiCatchingDuration } from "@/utils/app.constant";
import { getFormRead } from "@/services/CreateUserService";
import { showToastMessage } from "./Toastify";
import {
  capitalizeFirstLetterOfEachWordInArray,
  firstLetterInUpperCase,
} from "../utils/Helper";
import { getUserTableColumns, getTLTableColumns } from "@/data/tableColumns";
import { Button, TablePagination, useMediaQuery } from "@mui/material";
import { Theme } from "@mui/system";
import CommonUserModal from "./CommonUserModal";
import { useQuery } from "@tanstack/react-query";
import ReassignCenterModal from "./ReassignCenterModal";
import {
  getCenterList,
  getStateBlockDistrictList,
} from "@/services/MasterDataService";
import {
  rolesList,
  updateCohortMemberStatus,
  updateCohortUpdate,
} from "@/services/CohortService/cohortService";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { useRouter } from "next/router";
import SimpleModal from "./SimpleModal";
import userJsonSchema from "./UserUpdateSchema.json";
import DynamicForm from "@/components/DynamicForm";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { customFields } from "./GeneratedSchemas";
import { tenantId } from "../../app.config";

type UserDetails = {
  userId: any;
  username: any;
  name: any;
  role: any;
  mobile: any;
  centers?: any;
  Programs?: any;
  age?: any;
  state?: any;
  district?: any;
  blocks?: any;
  stateCode?: any;
  districtCode?: any;
  blockCode?: any;
  centerMembershipIdList?: any;
  blockMembershipIdList?: any;
  cohortIds?: any;
  districtValue?: any;
};
type FilterDetails = {
  role: any;
  status?: any;
  districts?: any;
  states?: any;
  blocks?: any;
  name?: any;
  cohortId?: any;
};
interface CenterProp {
  cohortId: string;
  name: string;
}
interface Cohort {
  cohortId: string;
  name: string;
  parentId: string | null;
  type: string;
  customField: any[];
  cohortMemberStatus?: string;
  cohortMembershipId?: string;
}
interface UserTableProps {
  role: string;
  userType: string;
  searchPlaceholder: string;
  handleAddUserClick: any;
  parentState?: boolean;
}
interface FieldProp {
  value: string;
  label: string;
}
const UserTable: React.FC<UserTableProps> = ({
  role,
  userType,
  searchPlaceholder,
  handleAddUserClick,
  parentState,
}) => {
  const [selectedState, setSelectedState] = React.useState<string[]>([]);
  const [blockMembershipIdList, setBlockMembershipIdList] = React.useState<
    string[]
  >([]);
  const [centerMembershipIdList, setCenterMembershipIdList] = React.useState<
    string[]
  >([]);
  const router = useRouter();

  const selectedBlockStore = useSubmittedButtonStore(
    (state: any) => state.selectedBlockStore
  );
  const setSelectedBlockStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedBlockStore
  );
  const selectedDistrictStore = useSubmittedButtonStore(
    (state: any) => state.selectedDistrictStore
  );
  const setSelectedDistrictStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedDistrictStore
  );
  const selectedCenterStore = useSubmittedButtonStore(
    (state: any) => state.selectedCenterStore
  );
  const setSelectedCenterStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedCenterStore
  );
  const setSubmittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setSubmittedButtonStatus
  );

  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedDistrict, setSelectedDistrict] = React.useState<string[]>([]);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedBlock, setSelectedBlock] = React.useState<string[]>([]);
  const [selectedBlockCode, setSelectedBlockCode] = useState("");
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [pageOffset, setPageOffset] = useState(0);
  const [pageLimit, setPageLimit] = useState(10);
  const [pageSizeArray, setPageSizeArray] = React.useState<number[]>([]);
  const [data, setData] = useState<UserDetails[]>([]);
  const [cohortsFetched, setCohortsFetched] = useState(false);
  const { t } = useTranslation();
  const [pageSize, setPageSize] = React.useState<string | number>("10");
  const [sortBy, setSortBy] = useState(["createdAt", "asc"]);
  const [sortByForCohortMemberList, setsortByForCohortMemberList] = useState([
    "name",
    SORT.ASCENDING,
  ]);
  const [statusValue, setStatusValue] = useState(Status.ACTIVE);
  const [pageCount, setPageCount] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReassignCohortModalOpen, setIsReassignCohortModalOpen] =
    useState(false);
  const [centers, setCenters] = useState<CenterProp[]>([]);
  const [userName, setUserName] = useState("");
  const [blocks, setBlocks] = useState<FieldProp[]>([]);
  const [userCohort, setUserCohorts] = useState("");
  const [assignedCenters, setAssignedCenters] = useState<any>();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [cohortId, setCohortId] = useState([]);
  const [block, setBlock] = useState("");
  const [district, setDistrict] = useState("");
  const [blockCode, setBlockCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [deleteUserState, setDeleteUserState] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<string[]>([]);
  const [selectedCenterCode, setSelectedCenterCode] = useState<string[]>([]);
  const [schema, setSchema] = React.useState(userJsonSchema);
  const [enableCenterFilter, setEnableCenterFilter] = useState<boolean>(false);

  const isMobile: boolean = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const [confirmButtonDisable, setConfirmButtonDisable] = useState(true);
  const [pagination, setPagination] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [formData, setFormData] = useState<any>();

  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [openAddLearnerModal, setOpenAddLearnerModal] = React.useState(false);
  const [userId, setUserId] = useState();
  const [submitValue, setSubmitValue] = useState<boolean>(false);
  const [isEditForm, setIsEditForm] = useState<boolean>(false);

  const uiSchema = {
    name: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your full name",
      "ui:help": "Full name, only letters and spaces are allowed.",
    },
    username: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your username",
    },
    // password: {
    //   "ui:widget": "password",
    //   "ui:placeholder": "Enter a secure password",
    //   "ui:help":
    //     "Password must be at least 8 characters long, with at least one letter and one number.",
    // },
    role: {
      "ui:widget": "select",
      "ui:placeholder": "Select a role",
    },
    mobileNo: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your 10-digit mobile number",
      // "ui:help": "Please enter a valid 10-digit mobile number.",
    },
    email: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your email address",
      "ui:options": {},
    },
  };
  const reassignButtonStatus = useSubmittedButtonStore(
    (state: any) => state.reassignButtonStatus
  );
  const {
    data: teacherFormData,
    isLoading: teacherFormDataLoading,
    error: teacherFormDataErrror,
  } = useQuery<any[]>({
    queryKey: ["teacherFormData"],
    queryFn: () => Promise.resolve([]),
    staleTime: apiCatchingDuration.GETREADFORM,
    enabled: false,
  });
  const {
    data: studentFormData,
    isLoading: studentFormDataLoading,
    error: studentFormDataErrror,
  } = useQuery<any[]>({
    queryKey: ["studentFormData"],
    queryFn: () => Promise.resolve([]),
    staleTime: apiCatchingDuration.GETREADFORM,
    enabled: false,
  });
  const {
    data: teamLeaderFormData,
    isLoading: teamLeaderFormDataLoading,
    error: teamLeaderFormDataErrror,
  } = useQuery<any[]>({
    queryKey: ["teamLeaderFormData"],
    queryFn: () => Promise.resolve([]),
    staleTime: apiCatchingDuration.GETREADFORM,
    enabled: false,
  });
  const handleOpenAddLearnerModal = () => {
    setIsEditForm(true);
  };
  const onCloseEditForm = () => {
    setIsEditForm(false);
    // setFormData({});
  };
  const handleModalSubmit = (value: boolean) => {
    submitValue ? setSubmitValue(false) : setSubmitValue(true);
  };
  const handleCloseAddLearnerModal = () => {
    setOpenAddLearnerModal(false);
  };
  const handleAddLearnerClick = () => {
    handleOpenAddLearnerModal();
  };
  const [openAddFacilitatorModal, setOpenAddFacilitatorModal] =
    React.useState(false);
  const handleOpenAddFacilitatorModal = () => {
    setOpenAddFacilitatorModal(true);
  };

  const handleCloseAddFacilitatorModal = () => {
    setOpenAddFacilitatorModal(false);
  };

  const [openAddTeamLeaderModal, setOpenAddTeamLeaderModal] =
    React.useState(false);
  const handleOpenAddTeamLeaderModal = () => {
    setOpenAddTeamLeaderModal(true);
  };

  const handleCloseAddTeamLeaderModal = () => {
    setOpenAddTeamLeaderModal(false);
  };

  const [filters, setFilters] = useState<FilterDetails>({
    role: role,
    status: [statusValue],
  });

  const handleChange = (event: SelectChangeEvent<typeof pageSize>) => {
    setPageSize(event.target.value);
    setPageLimit(Number(event.target.value));
  };

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPageOffset(value - 1);
  };

  const PagesSelector = () => (
    <>
      <Box sx={{ display: { xs: "block" } }}>
        <Pagination
          // size="small"
          color="primary"
          count={pageCount}
          page={pageOffset + 1}
          onChange={handlePaginationChange}
          siblingCount={0}
          boundaryCount={1}
          sx={{ marginTop: "10px" }}
        />
      </Box>
    </>
  );

  const PageSizeSelectorFunction = () => (
    <PageSizeSelector
      handleChange={handleChange}
      pageSize={pageSize}
      options={pageSizeArray}
    />
  );
  const handleStateChange = async (selected: string[], code: string[]) => {
    const newQuery = { ...router.query };

    if (newQuery.center) {
      delete newQuery.center;
    }
    if (newQuery.district) {
      delete newQuery.district;
    }
    if (newQuery.block) {
      delete newQuery.block;
    }
    router.replace({
      pathname: router.pathname,
      query: {
        ...newQuery,
        state: code?.join(","),
      },
    });
    setSelectedCenterCode([]);

    setEnableCenterFilter(false);
    setSelectedDistrict([]);
    setSelectedCenter([]);

    setSelectedBlock([]);
    setSelectedBlockCode("");
    setSelectedDistrictCode("");
    setSelectedState(selected);

    if (selected[0] === "" || selected[0] === t("COMMON.ALL_STATES")) {
      if (filters.status) setFilters({ status: [filters.status], role: role });
      else setFilters({ role: role });
    } else {
      const stateCodes = code?.join(",");
      setSelectedStateCode(stateCodes);
      if (filters.status)
        setFilters({
          states: stateCodes,
          role: role,
          status: filters.status,
        });
      else setFilters({ states: stateCodes, role: role });
    }
  };
  const handleFilterChange = async (
    event: React.SyntheticEvent,
    newValue: any
  ) => {
    setStatusValue(newValue);
    setSelectedFilter(newValue);
    if (newValue === Status.ACTIVE) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.ACTIVE],
      }));
    } else if (newValue === Status.ARCHIVED) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.ARCHIVED],
      }));
    } else {
      setFilters((prevFilters) => {
        const { status, ...restFilters } = prevFilters;
        return {
          ...restFilters,
        };
      });
    }
  };

  const handleDistrictChange = (selected: string[], code: string[]) => {
    const newQuery = { ...router.query };
    if (newQuery.center) {
      delete newQuery.center;
    }
    if (newQuery.block) {
      delete newQuery.block;
    }

    setSelectedCenterCode([]);

    setEnableCenterFilter(false);
    setSelectedCenter([]);

    setSelectedBlock([]);
    setSelectedDistrict(selected);
    setSelectedBlockCode("");
    localStorage.setItem("selectedDistrict", selected[0]);

    setSelectedDistrictStore(selected[0]);
    if (selected[0] === "" || selected[0] === t("COMMON.ALL_DISTRICTS")) {
      if (filters.status) {
        setFilters({
          // states: selectedStateCode,
          role: role,
          status: filters.status,
        });
      } else {
        setFilters({
          // states: selectedStateCode,
          role: role,
        });
      }
      if (newQuery.district) {
        delete newQuery.district;
      }
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          state: selectedStateCode,
        },
      });
    } else {
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          state: selectedStateCode,
          district: code?.join(","),
        },
      });
      const districts = code?.join(",");
      setSelectedDistrictCode(districts);
      if (filters.status) {
        setFilters({
          // states: selectedStateCode,
          // districts: districts,
          role: role,
          status: filters.status,
        });
      } else {
        setFilters({
          // states: selectedStateCode,
          // districts: districts,
          role: role,
        });
      }
    }
  };
  const handleBlockChange = (selected: string[], code: string[]) => {
    setSelectedCenterCode([]);

    setEnableCenterFilter(false);
    setSelectedCenter([]);
    const newQuery = { ...router.query };
    if (newQuery.center) {
      delete newQuery.center;
    }
    if (newQuery.block) {
      delete newQuery.block;
    }

    setSelectedBlock(selected);
    localStorage.setItem("selectedBlock", selected[0]);
    setSelectedBlockStore(selected[0]);
    if (selected[0] === "" || selected[0] === t("COMMON.ALL_BLOCKS")) {
      if (newQuery.block) {
        delete newQuery.block;
      }
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          state: selectedStateCode,
          district: selectedDistrictCode,
        },
      });
      if (filters.status) {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          role: role,
          status: filters.status,
        });
      } else {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          role: role,
        });
      }
    } else {
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          // state: selectedStateCode,
          // district: selectedDistrictCode,
          // block: code?.join(",")
        },
      });
      const blocks = code?.join(",");
      setSelectedBlockCode(blocks);
      if (filters.status) {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          // blocks: blocks,
          role: role,
          status: filters.status,
        });
      } else {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          // blocks: blocks,
          role: role,
        });
      }
    }
  };
  const handleCenterChange = async (selected: string[], code: string[]) => {
    if (code[0]) {
      router.replace({
        pathname: router.pathname,
        query: {
          ...router.query,
          state: selectedStateCode,
          district: selectedDistrictCode,
          block: selectedBlockCode,
          center: code[0],
        },
      });
    } else {
      const newQuery = { ...router.query };
      if (newQuery.center) {
        delete newQuery.center;
        router.replace({
          ...newQuery,
        });
      }
    }

    setSelectedCenterCode([code[0]]);

    setSelectedCenter(selected);
    localStorage.setItem("selectedCenter", selected[0]);
    setSelectedCenterStore(selected[0]);
    if (selected[0] === "" || selected[0] === t("COMMON.ALL_CENTERS")) {
      setEnableCenterFilter(false);
      setSelectedCenterCode([]);
      if (filters.status) {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          // blocks: selectedBlockCode,
          role: role,
          status: filters.status,
        });
      } else {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          // blocks: selectedBlockCode,
          role: role,
        });
      }
    } else {
      setEnableCenterFilter(true);

      setFilters({
        // states: selectedStateCode,
        // districts: selectedDistrictCode,
        // blocks: blocks,
        cohortId: code[0],
        role: role,
        status: [statusValue],
      });
    }
  };
  const handleSortChange = async (event: SelectChangeEvent) => {
    // let sort;
    if (event.target?.value === "Z-A") {
      enableCenterFilter
        ? setsortByForCohortMemberList(["name", SORT.DESCENDING])
        : setSortBy(["name", SORT.DESCENDING]);
    } else if (event.target?.value === "A-Z") {
      enableCenterFilter
        ? setsortByForCohortMemberList(["name", SORT.ASCENDING])
        : setSortBy(["name", SORT.ASCENDING]);
    } else {
      enableCenterFilter
        ? setsortByForCohortMemberList(["name", SORT.ASCENDING])
        : setSortBy(["createdAt", SORT.ASCENDING]);
    }

    setSelectedSort(event.target?.value as string);
  };
  const mapFields = (formFields: any, response: any) => {
    let initialFormData: any = {};
    formFields.fields.forEach((item: any) => {
      const userData = response?.userData;
      const customFieldValue = userData?.customFields?.find(
        (field: any) => field.fieldId === item.fieldId
      );

      const getValue = (data: any, field: any) => {
        if (item.default) {
          return item.default;
        }
        if (item?.isMultiSelect) {
          if (data[item.name] && item?.maxSelections > 1) {
            return [field?.value];
          } else if (item?.type === "checkbox") {
            return String(field?.value).split(",");
          } else {
            return field?.value?.toLowerCase();
          }
        } else {
          if (item?.type === "numeric") {
            return parseInt(String(field?.value));
          } else if (item?.type === "text") {
            return String(field?.value);
          } else {
            if (field?.value === "FEMALE" || field?.value === "MALE") {
              return field?.value?.toLowerCase();
            }
            return field?.value?.toLowerCase();
          }
        }
      };

      if (item.coreField) {
        if (item?.isMultiSelect) {
          if (userData[item.name] && item?.maxSelections > 1) {
            initialFormData[item.name] = [userData[item.name]];
          } else if (item?.type === "checkbox") {
            initialFormData[item.name] = String(userData[item.name]).split(",");
          } else {
            initialFormData[item.name] = userData[item.name];
          }
        } else if (item?.type === "numeric") {
          initialFormData[item.name] = Number(userData[item.name]);
        } else if (item?.type === "text" && userData[item.name]) {
          initialFormData[item.name] = String(userData[item.name]);
        } else {
          if (userData[item.name]) {
            initialFormData[item.name] = userData[item.name];
          }
        }
      } else {
        const fieldValue = getValue(userData, customFieldValue);

        if (fieldValue) {
          initialFormData[item.name] = fieldValue;
        }
      }
    });

    return initialFormData;
  };

  useEffect(() => {
    const fetchRoles = async () => {
      const obj = {
        limit: "10",
        page: 1,
        filters: {
          tenantId: formData?.tenantId,
        },
      };
      const response = await rolesList(obj);
      console.log({ response, formData });

      if (response?.result) {
        const rolesOptions = response.result.map((role: any) => ({
          const: role.roleId,
          title: role.title,
        }));

        setSchema((prevSchema) => ({
          ...prevSchema,
          properties: {
            ...prevSchema.properties,
            role: {
              ...prevSchema.properties.role,
              oneOf: rolesOptions,
            },
          },
        }));
      }
    };

    fetchRoles();
  }, [isEditForm]);
  const handleEdit = (rowData: any) => {
    setSubmitValue((prev) => !prev);
    setIsEditForm(true);
    const userId = rowData?.userId;
    setUserId(userId);
    console.log({ rowData });

    const initialFormData = {
      userId: rowData.userId || "",
      name: rowData.name || "",
      mobileNo: rowData.mobileNo || "",
      email: rowData.email || "",
      username: rowData.username || "",
      role: rowData.role || "",
    };

    setFormData(initialFormData);

    handleOpenAddLearnerModal();
  };

  const handleDelete = (rowData: any) => {
    setIsDeleteModalOpen(true);
    setUserName(rowData?.name);

    setBlockMembershipIdList(rowData.blockMembershipIdList);
    setCenterMembershipIdList(rowData.centerMembershipIdList);
    setSelectedUserId(rowData.userId);
    if (userType === Role.TEAM_LEADERS) {
      setUserCohorts(rowData.blocks);
    } else {
      setUserCohorts(rowData.centers);
    }
    //const userData="";
  };

  const handleSearch = (keyword: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      name: keyword,
    }));
  };

  useEffect(() => {
    const fetchUserList = async () => {
      setLoading(true);
      try {
        const fields = ["age", "districts", "states", "blocks", "gender"];
        let limit = pageLimit;
        let offset = pageOffset * limit;
        // const filters = { role: role , status:"active"};
        const sort = enableCenterFilter ? sortByForCohortMemberList : sortBy;
        if (filters.name) {
          offset = 0;
        }
        let resp;
        if (enableCenterFilter) {
          resp = await cohortMemberList({
            limit,
            filters,
            sort,
            offset,
            fields,
          });
        } else {
          resp = await userList({ limit, filters, sort, offset, fields });
        }
        const result = enableCenterFilter
          ? resp?.userDetails
          : resp?.getUserDetails;
        if (resp?.totalCount >= 15) {
          setPagination(true);

          setPageSizeArray([5, 10, 15]);
        } else if (resp?.totalCount >= 10) {
          setPagination(true);

          // setPageSize(resp?.totalCount);
          setPageSizeArray([5, 10]);
        } else if (resp?.totalCount > 5) {
          setPagination(false);

          setPageSizeArray([5]);
        } else if (resp?.totalCount <= 5) {
          setPagination(false);
          // setPageSize(resp?.totalCount);
          //PageSizeSelectorFunction();
        }

        setPageCount(Math.ceil(resp?.totalCount / pageLimit));
        let finalResult;
        if (enableCenterFilter) {
          finalResult = result?.map((user: any) => {
            const ageField = user?.customField?.find(
              (field: any) => field?.label === "AGE"
            );
            const genderField = user?.customField?.find(
              (field: any) => field?.label === "GENDER"
            );
            const blockField = user?.customField?.find(
              (field: any) => field?.label === "BLOCKS"
            );
            const districtField = user?.customField?.find(
              (field: any) => field?.label === "DISTRICTS"
            );
            const stateField = user?.customField?.find(
              (field: any) => field?.label === "STATES"
            );
            return {
              userId: user?.userId,
              username: user?.username,
              status: user?.status,
              email: user?.email,
              name:
                user?.name?.charAt(0).toUpperCase() +
                user?.name?.slice(1).toLowerCase(),
              role: user.role,
              //  gender: user.gender,
              mobile: user.mobile === "NaN" ? "-" : user.mobile,
              age: ageField ? ageField?.value : "-",
              district: districtField
                ? districtField?.value +
                  " , " +
                  firstLetterInUpperCase(blockField?.value)
                : "-",
              state: stateField ? stateField?.value : "-",
              blocks: blockField
                ? firstLetterInUpperCase(blockField?.value)
                : "-",
              gender: genderField
                ? genderField?.value?.charAt(0)?.toUpperCase() +
                  genderField?.value?.slice(1).toLowerCase()
                : "-",
              //  createdAt: user?.createdAt,
              //  updatedAt: user?.updatedAt,
              createdBy: user?.createdBy,
              updatedBy: user?.updatedBy,
              stateCode: stateField?.code,

              districtCode: districtField?.code,
              blockCode: blockField?.code,
              districtValue: districtField ? districtField?.value : "-",

              // // centers: null,
              // Programs: null,
            };
          });
        } else {
          finalResult = result?.map((user: any) => {
            const ageField = user?.customFields?.find(
              (field: any) => field?.label === "AGE"
            );
            const genderField = user?.customFields?.find(
              (field: any) => field?.label === "GENDER"
            );
            const blockField = user?.customFields?.find(
              (field: any) => field?.label === "BLOCKS"
            );
            const districtField = user?.customFields?.find(
              (field: any) => field?.label === "DISTRICTS"
            );
            const stateField = user?.customFields?.find(
              (field: any) => field?.label === "STATES"
            );

            return {
              userId: user.userId,
              username: user.username,
              status: user.status,
              email: user.email,
              tenantId: user.tenantId,
              name:
                user.name.charAt(0).toUpperCase() +
                user.name.slice(1).toLowerCase(),
              role: user.role,
              //  gender: user.gender,
              mobile: user.mobile === "NaN" ? "-" : user?.mobile,
              age: ageField ? ageField?.value : "-",
              district: districtField
                ? districtField?.value +
                  " , " +
                  firstLetterInUpperCase(blockField?.value)
                : "-",
              state: stateField ? stateField?.value : "-",
              blocks: blockField
                ? firstLetterInUpperCase(blockField?.value)
                : "-",
              gender: genderField
                ? genderField.value?.charAt(0)?.toUpperCase() +
                  genderField.value.slice(1).toLowerCase()
                : "-",
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              createdBy: user.createdBy,
              updatedBy: user.updatedBy,
              stateCode: stateField?.code,
              districtCode: districtField?.code,
              blockCode: blockField?.code,
              districtValue: districtField ? districtField?.value : "-",

              // centers: null,
              // Programs: null,
            };
          });
        }

        if (filters?.name) {
          const prioritizedResult = finalResult.sort((a: any, b: any) => {
            const aStartsWith = a.name.toLowerCase().startsWith(filters?.name);
            const bStartsWith = b.name.toLowerCase().startsWith(filters?.name);

            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return 0;
          });

          setData(prioritizedResult);
        } else {
          setData(finalResult);
        }

        setLoading(false);
        setCohortsFetched(false);
      } catch (error: any) {
        setLoading(false);

        if (error?.response && error?.response.status === 404) {
          setData([]);
          //showToastMessage("No data found", "info");
        }
      }
    };
    // if ((selectedBlockCode !== "") || (selectedDistrictCode !== "" && selectedBlockCode === "") || (userType===Role.TEAM_LEADERS && selectedDistrictCode!=="") ){
    //   fetchUserList();
    // }
    fetchUserList();
  }, [
    pageOffset,
    submitValue,
    pageLimit,
    sortBy,
    filters,
    parentState,
    deleteUserState,
    sortByForCohortMemberList,
    reassignButtonStatus,
    enableCenterFilter,
    userType,
  ]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (data.length === 0 || cohortsFetched) {
          return;
        }
        const newData = await Promise.all(
          data?.map(async (user) => {
            const response = await getCohortList(user.userId);
            // const cohortNames = response?.result?.cohortData?.map(
            //   (cohort: Cohort) => cohort.name,
            // );
            const cohortNames = response?.result?.cohortData
              ?.filter(
                (cohort: Cohort) =>
                  cohort.type !== "BLOCK" &&
                  cohort?.cohortMemberStatus !== "archived"
              )
              .map((cohort: Cohort) => cohort.name);
            const cohortIds = response?.result?.cohortData
              ?.filter(
                (cohort: Cohort) =>
                  cohort.type !== "BLOCK" &&
                  cohort?.cohortMemberStatus !== "archived"
              )
              .map((cohort: Cohort) => cohort.cohortId);

            const centerMembershipIdList = response?.result?.cohortData
              ?.filter(
                (cohort: Cohort) =>
                  cohort.type !== "BLOCK" &&
                  cohort?.cohortMemberStatus !== "archived"
              )
              .map((cohort: Cohort) => cohort.cohortMembershipId);
            const blockMembershipIdList = response?.result?.cohortData
              ?.filter(
                (cohort: Cohort) =>
                  cohort.type === "BLOCK" &&
                  cohort?.cohortMemberStatus !== "archived"
              )
              .map((cohort: Cohort) => cohort.cohortMembershipId);
            //  const cohortMembershipId=response?.result?.cohortData?.cohortMembershipId;

            let finalArray;
            if (cohortNames?.length >= 1) {
              finalArray = capitalizeFirstLetterOfEachWordInArray(cohortNames);
            }
            //   const finalArray=capitalizeFirstLetterOfEachWordInArray(cohortNames)
            return {
              ...user,
              centerMembershipIdList: centerMembershipIdList,
              blockMembershipIdList: blockMembershipIdList,
              cohortIds: cohortIds,
              centers: finalArray ? finalArray?.join(" , ") : "-",
            };
          })
        );
        setData(newData);
        setCohortsFetched(true);
      } catch (error: any) {
        console.log(error);
      }
    };

    fetchData();
  }, [data, cohortsFetched]);

  useEffect(() => {
    const fetchData = () => {
      try {
        const object = {
          // "limit": 20,
          // "offset": 0,
          fieldName: "states",
        };
        // const response = await getStateBlockDistrictList(object);
        // const result = response?.result?.values;
        if (typeof window !== "undefined" && window.localStorage) {
          const admin = localStorage.getItem("adminInfo");
          if (admin) {
            const stateField = JSON.parse(admin).customFields.find(
              (field: any) => field.label === "STATES"
            );
            if (!stateField.value.includes(",")) {
              setSelectedState([stateField.value]);
              setSelectedStateCode(stateField.code);

              // setFilters({
              //   states: stateField.code,
              //   //districts:selectedDistrictCode,
              //  // blocks:selectedBlockCode,
              //   role: role,
              //   status:[statusValue],
              // }

              // )

              // if( selectedDistrict.length===0 ||selectedDistrict[0]==="All Districts")
              // {
              //   const newQuery = { ...router.query };

              //   if (newQuery.district) {
              //    delete newQuery.district;
              //  }
              //   if (newQuery.block) {
              //     delete newQuery.block;
              //   }
              //   if(newQuery.center)
              //   {
              //     delete newQuery.center;
              //   }
              //   router.replace({
              //     pathname: router.pathname,
              //     query: {
              //       ...newQuery,
              //     }
              //   });

              // }
              // if( selectedBlock.length===0 ||selectedBlock[0]==="All Blocks")
              // {
              //   const newQuery = { ...router.query };

              //   // if (newQuery.district) {
              //   //   delete newQuery.district;
              //   // }

              //   if (newQuery.block) {
              //     delete newQuery.block;
              //   }
              //   if(newQuery.center)
              //   {
              //     delete newQuery.center;
              //   }
              //   router.replace({
              //     pathname: router.pathname,
              //     query: {
              //       ...newQuery,
              //     }
              //   });

              // }

              if (
                selectedDistrictCode &&
                selectedDistrict.length !== 0 &&
                selectedDistrict[0] !== t("COMMON.ALL_DISTRICTS")
              ) {
                setFilters({
                  states: stateField.code,
                  districts: selectedDistrictCode,
                  //  blocks:selectedBlockCode,
                  role: role,
                  status: [statusValue],
                });
              }
              if (
                selectedBlockCode &&
                selectedBlock.length !== 0 &&
                selectedBlock[0] !== t("COMMON.ALL_BLOCKS")
              ) {
                setFilters({
                  states: stateField.code,
                  districts: selectedDistrictCode,
                  blocks: selectedBlockCode,
                  role: role,
                  status: [statusValue],
                });
              }
            }

            // setStates(object);
          }
        }
        //  setStates(result);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [selectedBlockCode, selectedDistrictCode]);
  useEffect(() => {
    const fetchData = () => {
      if (userType === Role.TEAM_LEADERS) {
        setEnableCenterFilter(false);
      } else {
        if (selectedCenter.length !== 0) {
          if (
            selectedCenter[0] === "" ||
            selectedCenter[0] === t("COMMON.ALL_CENTERS")
          ) {
            setEnableCenterFilter(false);
          } else {
            setEnableCenterFilter(true);
          }
          //setEnableCenterFilter(true);
          if (selectedCenterCode.length !== 0) {
            setFilters({
              // states: selectedStateCode,
              // districts: selectedDistrictCode,
              // blocks: blocks,
              cohortId: selectedCenterCode[0],
              role: role,
              status: [statusValue],
            });
          }
        } else {
          setEnableCenterFilter(false);
          if (selectedCenterCode.length !== 0) setSelectedCenterCode([]);
        }
      }
    };

    fetchData();
  }, [selectedCenter, selectedCenterCode]);
  // useEffect(() => {
  //   const { state, district, block, center } = router.query;

  // {
  //   if (state) {
  //     setSelectedStateCode(state.toString());
  //   }
  //   if (district) {
  //     setSelectedDistrictCode(district.toString());
  //   }
  //   if (block) {
  //     setSelectedBlockCode(block.toString());
  //   }
  //   if ( center) {
  //     setSelectedCenter([center.toString()]);
  //   }
  //   setInitialized(true);
  // }
  // }, []);

  // useEffect(() => {

  //   // Handle replacement when only state and district codes are available
  //   if (selectedStateCode!=="" && selectedDistrictCode==="" && selectedBlockCode==="") {
  //     const newQuery = { ...router.query };

  //      if (newQuery.center) {
  //        delete newQuery.center;
  //      }
  //      if (newQuery.district) {
  //       delete newQuery.district;
  //     }
  //      if (newQuery.block) {
  //        delete newQuery.block;
  //      }
  //      router.replace({
  //        pathname: router.pathname,
  //        query: {
  //          ...newQuery,
  //          state: selectedStateCode,
  //        }
  //      });
  //    }
  //   if (selectedStateCode!=="" && selectedDistrictCode!=="" && selectedBlockCode==="") {
  //    const newQuery = { ...router.query };

  //     if (newQuery.center) {
  //       delete newQuery.center;
  //     }
  //     if (newQuery.block) {
  //       delete newQuery.block;
  //     }
  //     router.replace({
  //       pathname: router.pathname,
  //       query: {
  //         ...newQuery,
  //         state: selectedStateCode,
  //         district: selectedDistrictCode
  //       }
  //     });
  //   }

  //   // Handle replacement when state, district, and block codes are available
  //   if (selectedStateCode!=="" && selectedDistrictCode!=="" && selectedBlockCode!=="" && selectedCenter.length === 0) {
  //     const newQuery = { ...router.query };

  //     if (newQuery.center) {
  //       delete newQuery.center;
  //     }
  //     if (newQuery.block) {
  //       delete newQuery.block;
  //     }
  //     router.replace({
  //       pathname: router.pathname,
  //       query: {
  //         ...newQuery,
  //         state: selectedStateCode,
  //         district: selectedDistrictCode,
  //         block: selectedBlockCode
  //       }
  //     });
  //   }

  //   // Handle replacement when state, district, block, and center are all selected
  //   if (selectedStateCode !==""&& selectedDistrictCode!=="" && selectedBlockCode!=="" && selectedCenter.length !== 0) {

  //     if (userType !== Role.TEAM_LEADERS) {
  //       router.replace({
  //         pathname: router.pathname,
  //         query: {
  //           ...router.query,
  //           state: selectedStateCode,
  //           district: selectedDistrictCode,
  //           block: selectedBlockCode,
  //           center: selectedCenter
  //         }
  //       });
  //     }
  //   }
  // }, [selectedStateCode]);

  const handleCloseDeleteModal = () => {
    setSelectedReason("");
    setOtherReason("");
    setIsDeleteModalOpen(false);
    setConfirmButtonDisable(true);
  };
  const handleCloseReassignModal = () => {
    // setSelectedReason("");
    // setOtherReason("");
    setIsReassignCohortModalOpen(false);
    setSelectedUserId("");
    // setConfirmButtonDisable(true);
  };

  const handleDeleteUser = async (category: string) => {
    try {
      const userId = selectedUserId;
      const userData = {
        userData: {
          reason: selectedReason,
          status: "archived",
        },
      };
      const cohortDeletionResponse = await deleteUser(userId, userData);
      if (cohortDeletionResponse) {
        deleteUserState ? setDeleteUserState(false) : setDeleteUserState(true);
      }
      if (userType === Role.TEAM_LEADERS && blockMembershipIdList.length > 0) {
        blockMembershipIdList.forEach(async (item) => {
          const memberStatus = Status.ARCHIVED;
          const statusReason = selectedReason;
          const membershipId = item;

          const response = await updateCohortMemberStatus({
            memberStatus,
            statusReason,
            membershipId,
          });
        });
      } else {
        centerMembershipIdList.forEach(async (item) => {
          const memberStatus = Status.ARCHIVED;
          const statusReason = selectedReason;
          const membershipId = item;

          const response = await updateCohortMemberStatus({
            memberStatus,
            statusReason,
            membershipId,
          });
        });
      }

      // const response = await deleteUser(userId, userData);
      //   const memberStatus = Status.ARCHIVED;
      //   const statusReason = selectedReason;
      //   const membershipId = "";

      //   const teacherResponse = await updateCohortMemberStatus({
      //     memberStatus,
      //     statusReason,
      //     membershipId,
      //   });

      handleCloseDeleteModal();
      showToastMessage(t("COMMON.USER_DELETE_SUCCSSFULLY"), "success");
    } catch (error) {
      console.log("error while deleting entry", error);
    }
  };

  const extraActions: any = [
    { name: "Edit", onClick: handleEdit, icon: EditIcon },
    { name: "Delete", onClick: handleDelete, icon: DeleteIcon },
  ];
  const noUserFoundJSX = (
    <Box display="flex" marginLeft="40%" gap="20px">
      {/* <Image src={glass} alt="" /> */}
      <PersonSearchIcon fontSize="large" />
      <Typography marginTop="10px" variant="h2">
        {t("COMMON.NO_USER_FOUND")}
      </Typography>
    </Box>
  );

  const handleUpdateAction = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    setLoading(true);
    const formData = data?.formData;
    const schemaProperties = schema.properties;
    console.log({ formData });

    try {
      setLoading(true);
      setConfirmButtonDisable(true);
      // if (!selectedCohortId) {
      //   showToastMessage(t("CENTERS.NO_COHORT_ID_SELECTED"), "error");
      //   return;
      // }
      let cohortDetails = {
        name: formData?.name,
        status: formData?.status,
        type: formData?.type,
        // customFields: customFields,
      };
      console.log({ cohortDetails });

      // const resp = await updateCohortUpdate("", cohortDetails);
      // if (resp?.responseCode === 200 || resp?.responseCode === 201) {
      //   showToastMessage(t("CENTERS.CENTER_UPDATE_SUCCESSFULLY"), "success");
      //   setLoading(false);
      // } else {
      //   showToastMessage(t("CENTERS.CENTER_UPDATE_FAILED"), "error");
      // }
    } catch (error) {
      console.error("Error updating cohort:", error);
      showToastMessage(t("CENTERS.CENTER_UPDATE_FAILED"), "error");
    } finally {
      setLoading(false);
      setConfirmButtonDisable(false);
      onCloseEditForm();

      setIsEditForm(false);
    }
  };
  const handleChangeForm = (event: IChangeEvent<any>) => {
    console.log("Form data changed:", event.formData);
  };
  const handleError = (error: any) => {
    console.log("error", error);
  };
  const userProps = {
    showAddNew: false,
    userType: userType,
    searchPlaceHolder: searchPlaceholder,
    selectedState: selectedState,
    selectedDistrict: selectedDistrict,
    setSelectedDistrict: setSelectedDistrict,
    selectedBlock: selectedBlock,
    setSelectedBlock: setSelectedBlock,
    selectedSort: selectedSort,
    statusValue: statusValue,
    setStatusValue: setStatusValue,
    handleStateChange: handleStateChange,
    handleDistrictChange: handleDistrictChange,
    handleBlockChange: handleBlockChange,
    handleSortChange: handleSortChange,
    selectedFilter: selectedFilter,
    handleFilterChange: handleFilterChange,
    handleSearch: handleSearch,
    handleAddUserClick: handleAddUserClick,
    selectedBlockCode: selectedBlockCode,
    setSelectedBlockCode: setSelectedBlockCode,
    selectedDistrictCode: selectedDistrictCode,
    setSelectedDistrictCode: setSelectedDistrictCode,
    selectedStateCode: selectedStateCode,
    handleCenterChange: handleCenterChange,
    selectedCenter: selectedCenter,
    setSelectedCenter: setSelectedCenter,
    selectedCenterCode: selectedCenterCode,
    setSelectedCenterCode: setSelectedCenterCode,
    setSelectedStateCode: setSelectedStateCode,
    //  statusArchived:true,
  };

  return (
    <HeaderComponent {...userProps}>
      {loading ? (
        <Box
          width={"100%"}
          id="check"
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
        >
          <Loader showBackdrop={false} loadingText={t("COMMON.LOADING")} />
        </Box>
      ) : data?.length !== 0 && loading === false ? (
        <KaTableComponent
          columns={
            // role === Role.TEAM_LEADER
            getTLTableColumns(t, isMobile)
            // : getUserTableColumns(t, isMobile)
          }
          // reassignCohort={handleReassignCohort}
          data={data}
          limit={pageLimit}
          offset={pageOffset}
          PagesSelector={PagesSelector}
          PageSizeSelector={PageSizeSelectorFunction}
          pageSizes={pageSizeArray}
          extraActions={extraActions}
          showIcons={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pagination={pagination}
          // reassignCohort={reassignCohort}
          noDataMessage={data?.length === 0 ? t("COMMON.NO_USER_FOUND") : ""}
          // reassignType={userType===Role.TEAM_LEADERS?  t("COMMON.REASSIGN_BLOCKS"):  t("COMMON.REASSIGN_CENTERS")}
        />
      ) : (
        loading === false &&
        data.length === 0 && (
          <Box display="flex" marginLeft="40%" gap="20px">
            {/* <Image src={glass} alt="" /> */}
            <PersonSearchIcon fontSize="large" />
            <Typography marginTop="10px" variant="h2">
              {t("COMMON.NO_USER_FOUND")}
            </Typography>
          </Box>

          // <KaTableComponent
          //   columns={
          //     role === Role.TEAM_LEADER
          //       ? getTLTableColumns(t, isMobile)
          //       : getUserTableColumns(t, isMobile)
          //   }
          //   data={data}
          //   limit={pageLimit}
          //   offset={pageOffset}
          //   PagesSelector={PagesSelector}
          //   PageSizeSelector={PageSizeSelectorFunction}
          //   pageSizes={pageSizeArray}
          //   extraActions={extraActions}
          //   showIcons={true}
          //   onEdit={handleEdit}
          //   onDelete={handleDelete}
          //   pagination={false}
          //   noDataMessage={data.length === 0 ? noUserFoundJSX : ""}
          // />
        )
      )}

      <DeleteUserModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        selectedValue={selectedReason}
        setSelectedValue={setSelectedReason}
        handleDeleteAction={handleDeleteUser}
        otherReason={otherReason}
        setOtherReason={setOtherReason}
        confirmButtonDisable={confirmButtonDisable}
        setConfirmButtonDisable={setConfirmButtonDisable}
        centers={userCohort}
        userId={selectedUserId}
        userName={userName}
        userType={userType}
      />
      <SimpleModal
        open={isEditForm}
        onClose={onCloseEditForm}
        showFooter={false}
        modalTitle={t("USER.UPDATE_USER_DETAILS")}
      >
        {schema && uiSchema && (
          <DynamicForm
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={handleUpdateAction}
            onChange={handleChangeForm}
            onError={handleError}
            widgets={{}}
            showErrorList={true}
            customFields={customFields}
            formData={formData}
            id="update-center-form"
          >
            <Box
              style={{
                display: "flex",
                justifyContent: "right", // Centers the button horizontally
                marginTop: "20px", // Adjust margin as needed
              }}
              gap={2}
            >
              <Button
                variant="outlined"
                type="submit"
                form="update-center-form" // Add this line
                sx={{
                  fontSize: "14px",
                  fontWeight: "500",
                  width: "auto",
                  height: "40px",
                  marginLeft: "10px",
                }}
                onClick={onCloseEditForm}
              >
                {t("COMMON.CANCEL")}
              </Button>
              <Button
                variant="contained"
                type="submit"
                form="update-center-form" // Add this line
                sx={{
                  fontSize: "14px",
                  fontWeight: "500",
                  width: "auto",
                  height: "40px",
                  marginLeft: "10px",
                }}
                onClick={() => {
                  setSubmittedButtonStatus(true);
                }}
              >
                {t("COMMON.UPDATE")}
              </Button>
            </Box>
          </DynamicForm>
        )}
      </SimpleModal>

      <ReassignCenterModal
        open={isReassignCohortModalOpen}
        onClose={handleCloseReassignModal}
        userType={userType}
        cohortData={centers}
        blockList={blocks}
        userId={selectedUserId}
        blockName={block}
        districtName={district}
        blockCode={blockCode}
        districtCode={districtCode}
        cohortId={cohortId}
        centers={assignedCenters}
      />

      <CommonUserModal
        open={openAddLearnerModal}
        onClose={handleCloseAddLearnerModal}
        formData={formData}
        isEditModal={true}
        userId={userId}
        onSubmit={handleModalSubmit}
        userType={
          userType === Role.LEARNERS
            ? FormContextType.STUDENT
            : userType === Role.FACILITATORS
              ? FormContextType.TEACHER
              : FormContextType.TEAM_LEADER
        }
      />
    </HeaderComponent>
  );
};

export default UserTable;
