import * as React from 'react';
import { useAsync } from 'react-use';

import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  PreviewCatalogInfoComponent,
  PreviewPullRequestComponent,
} from '@backstage/plugin-catalog-import';
import {
  catalogApiRef,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';

import { makeStyles } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';

import {
  AddRepositoriesFormValues,
  PullRequestPreview,
  PullRequestPreviewData,
} from '../../types';

const useDrawerContentStyles = makeStyles(theme => ({
  previewCard: {
    marginTop: theme.spacing(1),
  },
  previewCardContent: {
    paddingTop: 0,
  },
}));

export const PreviewPullRequest = ({
  repoUrl,
  repoName,
  pullRequest,
  setPullRequest,
  formErrors,
  setFormErrors,
}: {
  repoUrl: string;
  repoName: string;
  pullRequest: PullRequestPreviewData;
  setPullRequest: React.Dispatch<React.SetStateAction<PullRequestPreviewData>>;
  formErrors: PullRequestPreviewData;
  setFormErrors: React.Dispatch<React.SetStateAction<PullRequestPreviewData>>;
}) => {
  const contentClasses = useDrawerContentStyles();
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  const catalogApi = useApi(catalogApiRef);
  const [search, setSearch] = React.useState<string>('');
  const [entityOwner, setEntityOwner] = React.useState<string | null>('');
  const { loading: groupsLoading, value: groups } = useAsync(async () => {
    const groupEntities = await catalogApi.getEntities({
      filter: { kind: 'group' },
    });

    return groupEntities.items
      .map(e => humanizeEntityRef(e, { defaultKind: 'group' }))
      .sort();
  });
  console.log('!!!entity ', entityOwner);
  React.useEffect(() => {
    if (
      !values.repositories[repoName]?.catalogInfoYaml?.prTemplate?.entityOwner
    ) {
      setFormErrors({
        ...formErrors,
        [repoName]: {
          ...formErrors?.[repoName],
          entityOwner: 'Entity owner is missing',
        },
      } as PullRequestPreviewData);
    }
    console.log(
      '!!!!values ',
      values.repositories[repoName]?.catalogInfoYaml?.prTemplate?.entityOwner,
    );

    setEntityOwner(
      values.repositories[repoName]?.catalogInfoYaml?.prTemplate?.entityOwner ||
        '',
    );
  }, [values]);

  const handleChange = (
    event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (event.target.name.split('.').find(s => s === 'prTitle')) {
      setPullRequest({
        ...pullRequest,
        [repoName as string]: {
          ...(pullRequest[repoName] as PullRequestPreview),
          prTitle: event.target.value,
        },
      });
      if (!event.target.value) {
        setFormErrors({
          ...formErrors,
          [repoName]: {
            ...formErrors?.[repoName],
            prTitle: 'Pull request title is missing',
          },
        } as { [name: string]: PullRequestPreview });
      } else {
        const err = { ...formErrors };
        delete err[repoName]?.prTitle;
        setFormErrors(err);
      }
    }
    if (event.target.name.split('.').find(s => s === 'prDescription')) {
      setPullRequest({
        ...pullRequest,
        [repoName as string]: {
          ...(pullRequest[repoName] as PullRequestPreview),
          prDescription: event.target.value,
        },
      });
      if (!event.target.value) {
        setFormErrors({
          ...formErrors,
          [repoName]: {
            ...formErrors?.[repoName],
            prDescription: 'Pull request description is missing',
          },
        } as PullRequestPreviewData);
      } else {
        const err = { ...formErrors };
        delete err[repoName].prDescription;
        setFormErrors(err);
      }
    }
    if (event.target.name.split('.').find(s => s === 'componentName')) {
      setPullRequest({
        ...pullRequest,
        [repoName as string]: {
          ...(pullRequest[repoName] as PullRequestPreview),
          componentName: event.target.value,
          yaml: {
            ...(pullRequest[repoName]?.yaml as Entity),
            metadata: {
              ...pullRequest[repoName]?.yaml.metadata,
              name: event.target.value,
            },
          },
        },
      });
      if (!event.target.value) {
        setFormErrors({
          ...formErrors,
          [repoName]: {
            ...formErrors?.[repoName],
            componentName: 'Component name is missing',
          },
        } as PullRequestPreviewData);
      } else {
        const err = { ...formErrors };
        delete err[repoName]?.componentName;
        setFormErrors(err);
      }
    }
  };

  return (
    <>
      <Box marginTop={2}>
        <Typography fontSize="17px" fontWeight="900">
          Pull request details
        </Typography>
      </Box>

      <TextField
        label="Pull request title"
        placeholder="Add Backstage catalog entity descriptor files"
        margin="normal"
        variant="outlined"
        fullWidth
        name={`repositories.${pullRequest.componentName}.prTitle`}
        value={pullRequest?.[repoName]?.prTitle}
        onChange={handleChange}
        error={!!formErrors?.[repoName]?.prTitle}
        required
      />

      <TextField
        label="Pull request body"
        placeholder="A describing text with Markdown support"
        margin="normal"
        variant="outlined"
        fullWidth
        onChange={handleChange}
        name={`repositories.${pullRequest.componentName}.prDescription`}
        value={pullRequest?.[repoName]?.prDescription}
        error={!!formErrors?.[repoName]?.prDescription}
        multiline
        required
      />

      <Box marginTop={2}>
        <Typography fontSize="14px" fontWeight={'700'}>
          Entity configuration
        </Typography>
      </Box>

      <TextField
        label="Name of the created component"
        placeholder="my-component"
        margin="normal"
        variant="outlined"
        onChange={handleChange}
        value={pullRequest?.[repoName]?.componentName}
        name={`repositories.${pullRequest.componentName}.componentName`}
        error={!!formErrors?.[repoName]?.componentName}
        fullWidth
        required
      />
      <br />
      <br />

      <Autocomplete
        options={groups || []}
        getOptionSelected={(option: any, value: any) =>
          option.etag === value.etag
        }
        loading={groupsLoading}
        loadingText="Loading groups"
        disableClearable
        value={entityOwner}
        onChange={(_event: React.ChangeEvent<{}>, value: string | null) => {
          setEntityOwner(value);
          if (value) {
            setSearch(value);
            setPullRequest({
              ...pullRequest,
              [repoName as string]: {
                ...(pullRequest[repoName] as PullRequestPreview),
                entityOwner: value,
              },
            });
            const err = { ...formErrors };
            delete err[repoName].entityOwner;
            setFormErrors(err);
          }
        }}
        inputValue={search}
        onInputChange={(_e, newSearch: string, reason) => {
          reason === 'input' && setSearch(newSearch);
          if (!newSearch) {
            setEntityOwner('');
            setPullRequest({
              ...pullRequest,
              [repoName as string]: {
                ...(pullRequest[repoName] as PullRequestPreview),
                entityOwner: '',
              },
            });
            setFormErrors({
              ...formErrors,
              [repoName]: {
                ...formErrors?.[repoName],
                entityOwner: 'Entity Owner is required',
              },
            } as PullRequestPreviewData);
          }
        }}
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            error={!!formErrors?.[repoName]?.entityOwner}
            label="Entity owner"
            placeholder="my-group"
            helperText={
              !!formErrors?.[repoName]?.entityOwner
                ? 'Entity owner is required'
                : 'Select an owner from the list or enter a reference to a Group or a User'
            }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {groupsLoading ? (
                    <CircularProgress color="inherit" size="1em" />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
            required
          />
        )}
      />

      <FormControlLabel
        control={
          <Checkbox
            value={pullRequest?.[repoName]?.useCodeOwnersFile}
            onChange={(_, value) => {
              setPullRequest({
                ...pullRequest,
                [repoName as string]: {
                  ...(pullRequest[repoName] as PullRequestPreview),
                  useCodeOwnersFile: value,
                },
              });
            }}
          />
        }
        label={
          <>
            Use <em>CODEOWNERS</em> file as Entity Owner
          </>
        }
      />
      <FormHelperText>
        WARNING: This may fail if no CODEOWNERS file is found at the target
        location.
      </FormHelperText>
      <Box marginTop={2}>
        <Typography fontSize="14px" fontWeight={'700'}>
          Preview pull request
        </Typography>
      </Box>

      <PreviewPullRequestComponent
        title={pullRequest?.[repoName]?.prTitle as string}
        description={pullRequest?.[repoName]?.prDescription as string}
        classes={{
          card: contentClasses.previewCard,
          cardContent: contentClasses.previewCardContent,
        }}
      />

      <Box marginTop={2} marginBottom={1}>
        <Typography fontSize="14px" fontWeight={'700'}>
          Preview entities
        </Typography>
      </Box>

      <PreviewCatalogInfoComponent
        entities={[pullRequest?.[repoName]?.yaml as Entity]}
        repositoryUrl={repoUrl}
        classes={{
          card: contentClasses.previewCard,
          cardContent: contentClasses.previewCardContent,
        }}
      />
    </>
  );
};
