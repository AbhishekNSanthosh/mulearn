import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import styles from "../../utils/modalForm.module.css";

import toast from "react-hot-toast";
import useLocationData from "@/MuLearnComponents/CascadingSelects/useLocationData";
import {
    editManageUsers,
    editUsers,
    getCollegeOptions,
    getCommunities,
    getInterests,
    getManageUsersDetails,
    getRoles
} from "./apis";
import CountryStateDistrict from "@/MuLearnComponents/CascadingSelects/CountryStateDistrict";
import Select from "react-select";
import { customReactSelectStyles } from "../../utils/common";
import { getColleges } from "src/modules/Common/Authentication/services/onboardingApis";

type Props = { id: string };

type InitialLocationData = {
    country: { label: string; value: string };
    state: { label: string; value: string };
    district: { label: string; value: string };
} | null;
const requiredFields = ["first_name", "email", "mobile"];
const UserForm = forwardRef(
    (props: Props & { closeModal: () => void }, ref: any) => {
        const [initialData, setInitialData] =
            useState<InitialLocationData>(null);

        const {
            locationData,
            loadingCountries,
            loadingStates,
            loadingDistricts,
            handleCountryChange,
            handleStateChange,
            handleDistrictChange
        } = useLocationData(initialData);

        const [data, setData] = useState<UserData>({
            first_name: "",
            last_name: "",
            email: "",
            mobile: "",
            discord_id: "",
            organizations: [],
            department: "",
            role: [],
            interest_groups: []
        });

        const [errors, setErrors] = useState<OrgFormErrors>({});

        //Fetch the initial data if in edit mode
        useEffect(() => {
            // Replace this with your actual API call
            getManageUsersDetails(props.id).then(
                (data: UserDataFromBackend) => {
                    console.log(data.organizations);
                    if (data.organizations) {
                        const college = data.organizations!.filter(
                            org => org.org_type === "College"
                        )[0];
                        if (college) {
                            setInitialData({
                                country: {
                                    label: "",
                                    value: college.country
                                },
                                state: {
                                    label: "",
                                    value: college.state
                                },
                                district: {
                                    label: "",
                                    value: college.district
                                }
                            });
                        }

                        setSelectData(selectData => ({
                            ...selectData,
                            selectedCommunity: data.organizations
                                ? data.organizations
                                    .filter(
                                        org => org.org_type === "Community"
                                    )
                                    .map(org => org.org)
                                : [],
                            selectedInterestGroups: data.interest_groups
                                ? data.interest_groups
                                : [],
                            selectedRoles: data.role ? data.role : [],
                            selectedCollege: college ? college.org : "",
                            selectedDepartment: college
                                ? college.department
                                : ""
                        }));
                    }
                    setData({
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        mobile: data.mobile,
                        discord_id: data.discord_id,
                        organizations: !data.organizations
                            ? []
                            : data.organizations!.map(org => org.org),
                        department: "",
                        role: data.role,
                        interest_groups: data.interest_groups
                    });
                }
            );
        }, [props.id]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;

            setData(prevData => ({ ...prevData, [name]: value }));
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            if (!value.trim()) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    [name]: `${name.charAt(0).toUpperCase() + name.slice(1)
                        } is required`
                }));
            } else {
                setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
            }
        };

        const fetchData = async () => {
            try {
                const communities = await getCommunities();
                setSelectData(prevState => ({
                    ...prevState,
                    community: communities.map(community => ({
                        label: community.title,
                        value: community.id
                    }))
                }));
                const roles = await getRoles();
                setSelectData(prevState => ({
                    ...prevState,
                    roles: roles.map(roles => ({
                        label: roles.title,
                        value: roles.id
                    }))
                }));

                const interestGroups = await getInterests();

                setIg(interestGroups);
            } catch (error) {
                // Handle error here
            }
        };

        const [college, setCollege] = useState<AffiliationOption[]>([]);
        const [department, setDepartment] = useState<AffiliationOption[]>([]);
        const [ig, setIg] = useState<AffiliationOption[]>([]);
        const [selectedIg, setSelectedIg] = useState<AffiliationOption[]>([]);
        const [selectedRoles, setSelectedRoles] = useState<AffiliationOption[]>(
            []
        );
        const [selectData, setSelectData] = useState({
            community: [] as AffiliationOption[],
            selectedCommunity: [] as string[],
            roles: [] as AffiliationOption[],
            selectedRoles: [] as string[],
            // interestGroups: [] as AffiliationOption[],
            selectedInterestGroups: [] as string[],
            selectedCollege: "",
            selectedDepartment: "",
            blurStatus: {
                community: false,
                roles: false,
                interestGroups: false,
                college: false,
                department: false
            }
        });
        // Add this state for blur status

        useEffect(() => {
            fetchData();
        }, []);

        useEffect(() => {
            getCollegeOptions(
                setCollege,
                setDepartment,
                locationData.selectedDistrict?.value as string
            );
        }, [locationData]);

        useEffect(() => { }, [selectData.roles]);

        //! useImperativeHandle for triggering submit from MuModal button
        useImperativeHandle(ref, () => ({
            handleSubmitExternally: handleSubmit
        }));
        const handleSubmit = (e?: React.FormEvent) => {
            e?.preventDefault();
            const convertedRoles = selectedRoles.map(option => option?.value);
            const updatedData = {
                ...data,
                // affiliation: String(selectedAffiliation??.value),
                country: (locationData.selectedCountry?.value),
                state: (locationData.selectedState?.value),
                district: (locationData.selectedDistrict?.value),
                roles: selectData.selectedRoles,
                interest_groups: selectedIg.map(option => option?.value),
                organizations: [selectData.selectedCollege],
                department: selectData.selectedDepartment,
                community: selectData.selectedCommunity
            };

            for (const key in updatedData) {
                if (
                    updatedData[key as keyof typeof updatedData] === undefined ||
                    updatedData[key as keyof typeof updatedData] === null ||
                    updatedData[key as keyof typeof updatedData] === "" ||
                    updatedData[key as keyof typeof updatedData] === "undefined"
                ) {
                    delete updatedData[key as keyof typeof updatedData];
                }
            }

            // Validate form data
            let isValid = true;
            for (const key of requiredFields) {
                if (!updatedData[key as keyof UserData]) {
                    console.log(key);
                    isValid = false;
                    setErrors(prevErrors => ({
                        ...prevErrors,
                        [key]: `${key.charAt(0).toUpperCase() + key.slice(1)} is required`
                    }));
                    toast.error(`Error: ${key} is required`);
                }
            }

            if (isValid) {
                toast.promise(editUsers(props.id, updatedData), {
                    loading: "Saving...",
                    success: () => {
                        props.closeModal();
                        return <b>Organization added</b>;
                    },
                    error: <b>Failed to add new organization</b>
                });
            }
        };

        return (
            <div className={styles.container}>
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            name="first_name"
                            placeholder="First Name"
                            value={data.first_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {errors.first_name && (
                            <div style={{ color: "red" }}>
                                {errors.first_name}
                            </div>
                        )}
                    </div>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name"
                            value={data.last_name}
                            onChange={handleChange}
                        // onBlur={handleBlur}
                        />
                        {errors.last_name && (
                            <div style={{ color: "red" }}>
                                {errors.last_name}
                            </div>
                        )}
                    </div>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            name="email"
                            placeholder="Email"
                            value={data.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {errors.email && (
                            <div style={{ color: "red" }}>{errors.email}</div>
                        )}
                    </div>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            name="mobile"
                            placeholder="Mobile"
                            value={data.mobile}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {errors.mobile && (
                            <div style={{ color: "red" }}>{errors.mobile}</div>
                        )}
                    </div>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            name="discord_id"
                            placeholder="DiscordId"
                            value={data.discord_id as string}
                            onChange={handleChange}
                        // onBlur={handleBlur}
                        />
                        {errors.discord_id && (
                            <div style={{ color: "red" }}>
                                {errors.discord_id}
                            </div>
                        )}
                    </div>

                    <div className={styles.inputContainer}>
                        <Select
                            styles={customReactSelectStyles}
                            options={selectData.community}
                            isClearable
                            isMulti
                            placeholder="Community"
                            isLoading={!selectData.community.length}
                            value={selectData.community.filter(comm =>
                                selectData.selectedCommunity.includes(
                                    comm?.value
                                )
                            )}
                            onChange={(selectedOptions: any) => {
                                setSelectData(prevState => ({
                                    ...prevState,
                                    selectedCommunity: selectedOptions.map(
                                        (opt: any) => opt?.value
                                    )
                                }));
                            }}
                            onBlur={() => {
                                setSelectData(prev => ({
                                    ...prev,
                                    blurStatus: {
                                        ...prev.blurStatus,
                                        community: true
                                    }
                                }));
                            }}
                        />
                        {/* {selectData.blurStatus.community &&
                            !selectData.selectedCommunity && (
                                <div style={{ color: "red" }}>
                                    Community is Required
                                </div>
                            )} */}
                    </div>

                    <div className={styles.inputContainer}>
                        <Select
                            styles={customReactSelectStyles}
                            options={selectData.roles}
                            isClearable
                            isMulti
                            placeholder="Roles"
                            isLoading={!selectData.roles.length}
                            value={selectData.roles.filter(roles =>
                                selectData.selectedRoles.includes(roles?.value)
                            )}
                            onChange={(selectedOptions: any) => {
                                setSelectData(selectData => ({
                                    ...selectData,
                                    selectedRoles: selectedOptions.map(
                                        (opt: any) => opt?.value
                                    )
                                }));
                                // setSelectedRoles(selectedOptions);
                            }}
                            onBlur={() => {
                                setSelectData(prev => ({
                                    ...prev,
                                    blurStatus: {
                                        ...prev.blurStatus,
                                        roles: true
                                    }
                                }));
                            }}
                        />
                        {/* {selectData.blurStatus.roles &&
                            !selectData.selectedRoles && (
                                <div style={{ color: "red" }}>
                                    Roles is Required
                                </div>
                            )} */}
                    </div>

                    <div className={styles.inputContainer}>
                        <Select
                            styles={customReactSelectStyles}
                            options={ig}
                            isClearable
                            isMulti
                            placeholder="Interest Groups"
                            isLoading={ig.length ? false : true}
                            // value={selectData.selectedInterestGroups}
                            onChange={(selectedOptions: any) => {
                                setSelectedIg(selectedOptions);
                            }}
                            onBlur={() => {
                                setSelectData(prev => ({
                                    ...prev,
                                    blurStatus: {
                                        ...prev.blurStatus,
                                        interest_groups: true
                                    }
                                }));
                            }}
                            value={ig.filter(val =>
                                selectData.selectedInterestGroups.includes(
                                    val?.value
                                )
                            )}
                        />
                        {/* {selectData.blurStatus.interestGroups &&
                            !selectData.selectedInterestGroups && (
                                <div style={{ color: "red" }}>
                                    IG is Required
                                </div>
                            )} */}
                    </div>

                    <CountryStateDistrict
                        countries={locationData.countries}
                        states={locationData.states}
                        districts={locationData.districts}
                        selectedCountry={locationData.selectedCountry}
                        selectedState={locationData.selectedState}
                        selectedDistrict={locationData.selectedDistrict}
                        loadingCountries={loadingCountries}
                        loadingStates={loadingStates}
                        loadingDistricts={loadingDistricts}
                        onCountryChange={handleCountryChange}
                        onStateChange={handleStateChange}
                        onDistrictChange={handleDistrictChange}
                        notRequired={true}
                    />

                    <div className={styles.inputContainer}>
                        <Select
                            styles={customReactSelectStyles}
                            options={college}
                            isClearable
                            placeholder="College"
                            isLoading={!college.length}
                            value={college.filter(
                                college =>
                                    college?.value === selectData.selectedCollege
                            )}
                            onChange={(selectedOptions: any) => {
                                setSelectData(prevState => ({
                                    ...prevState,
                                    selectedCollege: selectedOptions?.value
                                }));
                            }}
                            onBlur={() => {
                                setSelectData(prev => ({
                                    ...prev,
                                    blurStatus: {
                                        ...prev.blurStatus,
                                        college: true
                                    }
                                }));
                            }}
                        />
                        {/* {selectData.blurStatus.college &&
                            !selectData.selectedCollege && (
                                <div style={{ color: "red" }}>
                                    College is Required
                                </div>
                            )} */}
                    </div>

                    <div className={styles.inputContainer}>
                        <Select
                            styles={customReactSelectStyles}
                            options={department}
                            isClearable
                            placeholder="Department"
                            isLoading={!department.length}
                            value={department.filter(
                                dep =>
                                    (dep?.value as any) ===
                                    selectData.selectedDepartment
                            )}
                            onChange={(selectedOptions: any) => {
                                setSelectData(prevState => ({
                                    ...prevState,
                                    selectedDepartment: selectedOptions?.value
                                }));
                            }}
                            onBlur={() => {
                                setSelectData(prev => ({
                                    ...prev,
                                    blurStatus: {
                                        ...prev.blurStatus,
                                        department: true
                                    }
                                }));
                            }}
                        />
                        {/* {selectData.blurStatus.department &&
                            !selectData.selectedDepartment && (
                                <div style={{ color: "red" }}>
                                    Department is Required
                                </div>
                            )} */}
                    </div>
                </form>
            </div>
        );
    }
);

export default UserForm;
