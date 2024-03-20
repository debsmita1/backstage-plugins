import React from 'react';

import { Link } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import HelpIcon from '@mui/icons-material/HelpOutline';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';

import { AddRepositoriesFormValues } from '../../types';
import { getRepositoriesSelected } from '../../utils/repository-utils';
import { AddRepositoriesTable } from './AddRepositoriesTable';

const useStyles = makeStyles(theme => ({
  createButton: {
    marginRight: theme.spacing(1),
  },
  body: {
    marginBottom: '50px',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
    position: 'fixed',
    bottom: 0,
    paddingTop: '24px',
    paddingBottom: '24px',
    backgroundColor: theme.palette.background.default,
    width: '100%',
    borderTopStyle: 'groove',
  },
  tooltip: {
    whiteSpace: 'nowrap',
  },
  approvalTool: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
    alignItems: 'center',
    paddingTop: '24px',
    paddingBottom: '24px',
    paddingLeft: '16px',
    backgroundColor: theme.palette.background.paper,
    borderBottomStyle: 'groove',
  },

  approvalToolTooltip: {
    paddingTop: '4px',
    paddingRight: '24px',
    paddingLeft: '5px',
  },
}));

export const AddRepositoriesForm = ({
  initialValues,
}: {
  initialValues: AddRepositoriesFormValues;
}) => {
  const styles = useStyles();

  const formik = useFormik<AddRepositoriesFormValues>({
    enableReinitialize: true,
    initialValues,
    onSubmit: async (_values: AddRepositoriesFormValues) => {},
  });
  const submitTitle =
    (formik.values.approvalTool === 'git'
      ? 'Create pull request'
      : 'Create ServiceNow ticket') +
    (getRepositoriesSelected(formik.values) > 1 ? 's' : '');

  return (
    <FormControl fullWidth>
      <div className={styles.body}>
        <span className={styles.approvalTool}>
          <Typography fontSize="16px" fontWeight="500">
            Approval tool
          </Typography>
          <Tooltip
            placement="top"
            title="When adding a new repository, it requires approval. Once it's approved and the PR is approved or the ServiceNow tickets closed, the repositories will be added to the Catalog page."
          >
            <span className={styles.approvalToolTooltip}>
              <HelpIcon fontSize="small" />
            </span>
          </Tooltip>
          <RadioGroup
            id="approval-tool"
            data-testid="approval-tool"
            row
            aria-labelledby="approval-tool"
            name="approvalTool"
            value={formik.values.approvalTool}
            onChange={formik.handleChange}
          >
            <FormControlLabel value="git" control={<Radio />} label="Git" />
            <FormControlLabel
              value="servicenow"
              control={<Radio />}
              label="ServiceNow"
            />
          </RadioGroup>
        </span>
        <AddRepositoriesTable
          title="Selected repositories"
          selectedRepositoriesFormData={formik.values}
          setFieldValue={formik.setFieldValue}
        />
      </div>
      <br />
      <div className={styles.footer}>
        <Tooltip
          classes={{ tooltip: styles.tooltip }}
          title="Please wait until the catalog-info.yaml files are generated"
        >
          <span>
            <Button
              variant="contained"
              onClick={formik.handleSubmit as any}
              className={styles.createButton}
              disabled={getRepositoriesSelected(formik.values) === 0}
            >
              {submitTitle}
            </Button>
          </span>
        </Tooltip>
        <Link to="/bulk-import/repositories">
          <Button variant="outlined">Cancel</Button>
        </Link>
      </div>
    </FormControl>
  );
};
