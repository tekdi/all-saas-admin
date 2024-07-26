import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import { Search, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import CustomStepper from "./Steper";
import { useTranslation } from "next-i18next";

const FilterSearchBar = ({
  grade,
  medium,
  searchQuery,
  handleGradeChange,
  handleMediumChange,
  handleSearchChange,
  selectedOption,
  handleDropdownChange,
  card,
  selectFilter,
  onBackClick,
  showGradeMedium = true,
  showFoundaitonCourse = true,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {showFoundaitonCourse && (
        <Box>
          <Typography variant="h1">{t("SIDEBAR.FOUNDATION_COURSE")}</Typography>
        </Box>
      )}
      {showGradeMedium && (
        <Box sx={{ p: 1, display: "flex", mb: 2, gap: 2 }}>
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: "120px" }}
          >
            <InputLabel id="grade-label">
              {t("COURSE_PLANNER.GRADE")}
            </InputLabel>
            <Select
              labelId="grade-label"
              value={grade}
              onChange={handleGradeChange}
              label="Grade"
            >
              <MenuItem value="grade1">Grade 1</MenuItem>
              <MenuItem value="grade2">Grade 2</MenuItem>
              <MenuItem value="grade3">Grade 3</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: "120px" }}
          >
            <InputLabel id="medium-label">
              {t("COURSE_PLANNER.MEDIUM")}
            </InputLabel>
            <Select
              labelId="medium-label"
              value={medium}
              onChange={handleMediumChange}
              label="Medium"
            >
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="hindi">Hindi</MenuItem>
              <MenuItem value="marathi">Marathi</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {card && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2 }}>
          <IconButton onClick={onBackClick}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h2">{card.state}</Typography>
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            <CustomStepper completedSteps={card.boardsUploaded} />
            <Typography
              sx={{
                fontSize: "14px",
                color: "#7C766F",
              }}
            >
              ({card.boardsUploaded}/{card.totalBoards}{" "}
              {t("COURSE_PLANNER.BOARDS_FULLY_UPLOADED")})
            </Typography>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          gap: "8px",
          width: "100%",
          mb: 3,
        }}
      >
        <TextField
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t("COURSE_PLANNER.SEARCH")}
          variant="outlined"
          size="small"
          sx={{
            flexGrow: 1,
            width: "80%",
            height: "48px",
            borderRadius: "28px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "28px",
              height: "100%",
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControl
          variant="outlined"
          size="small"
          sx={{ minWidth: "120px", padding: "3px" }}
        >
          <InputLabel id="filter-label">
            {t("COURSE_PLANNER.FILTER")}
          </InputLabel>
          <Select
            labelId="filter-label"
            value={selectFilter}
            onChange={handleDropdownChange}
            label="Filter"
          >
            <MenuItem value="Option 1">Option 1</MenuItem>
            <MenuItem value="Option 2">Option 2</MenuItem>
            <MenuItem value="Option 3">Option 3</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </>
  );
};

export default FilterSearchBar;