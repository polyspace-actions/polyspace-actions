# Use Polyspace with Github Actions

With [GitHub&reg; Actions](https://docs.github.com/en/actions/learn-github-actions), you can run a Polyspace&reg; analysis on your C or C++ code as part of your workflow. Polyspace can identify run-time errors, concurrency issues, security vulnerabilities, and other defects. You can also use Polyspace to check for compliance with coding standards such as  MISRA C&trade;, MISRA C++, JSF++, CERT&reg; C, and CERT C++.

The actions let you run a Polyspace analysis on [self-hosted](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners) runners, upload and display the results on GitHub, and optionally upload the results to Polyspace Access&trade;.

## Overview of Actions

This table describes the available Polyspace actions. Use the appropriate action when you define your workflow in the `.github/workflows` folder.

|Action | Description |
|-------|--------------|
|**[polyspace-bug-finder](https://github.com/polyspace-actions/polyspace-bug-finder)**| Configure and run a Polyspace Bug Finder&trade; Server&trade; analysis and upload results to Polyspace Access (Uploads require Polyspace Access API key). Specify this action as `polyspace-actions/polyspace-bug-finder@24.1.0`.|
|**[polyspace-findings](https://github.com/polyspace-actions/polyspace-findings)**| Add information about Polyspace analysis findings to your commit when you push changes to the repository or to your pull request. Specify this action as `polyspace-actions/polyspace-findings@24.1.0`.

## Examples

### Run a Polyspace Bug Finder Server Analysis and Upload Results to Polyspace Access

You can use the `polyspace-bug-finder` action to analyze your files each time you push your changes to the `main` branch. The action takes the path of a compilation database file `compilation-database-file` as an input. This action assumes the paths to the Polyspace binaries are on your system `PATH` variable.

```yaml
name: Run Polyspace analysis on push
on: [push]
  branches:
    - 'main'
jobs:
  my-job:
    name: Run analysis
    runs-on: self-hosted

    steps:
    - name: Check out repository
      uses: actions/checkout@v3
    - name: Generate compilation database
      uses: cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON .
    - name: Analyze
      uses: polyspace-actions/polyspace-bug-finder@24.1.0
      with:
        compilation-database-file: compile_commands.json
        checkers-file: checkers.xml
        host: ${{ env.ACCESS_HOST }}
        api-key: ${{ secrets.API_KEY }}
        project-name: ${{github.ref_name}}
        parent-project: ${{github.event.repository.name}}
```

### Analyze Only Files That Changed in Pull Request

Use the action to reduce the scope of the analysis to only files that have changes when you open a pull request. In this example, the Polyspace installation folder path (`/opt/Polyspace`) is provided with input `polyspace-installation-folder`.

```yaml
name: Run Polyspace Analysis
on:
  pull_request:
    types: [opened, reopened, edited, synchronize]
jobs:
  my-job:
    name: Run analysis
    runs-on: self-hosted

    steps:
    - name: Check out repository
      uses: actions/checkout@v3
    - name: Generate compilation database
      uses: cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON .
    - name: Analyze pull request
      uses: polyspace-actions/polyspace-bug-finder@24.1.0
      with:
        polyspace-installation-folder: /opt/Polyspace
        compilation-database-file: compile_commands.json
        checkers-file: checkers.xml
        pull-request-reduced-analysis: true
        host: ${{ env.ACCESS_HOST }}
        api-key: ${{ secrets.API_KEY }}
        project-name: ${{github.head_ref}}_pr
        parent-project: ${{github.event.repository.name}}
```

### Add Analysis Results as Annotation in Your Commit

Use this action to start an analysis every time you push your changes to any branch on the repository. Polyspace then shows the results as annotations in the pull request.

```yaml
name: Run Polyspace analysis on PR
on: [push]
  branches:
    - '**' #All branches
jobs:
  my-job:
    name: Run analysis
    runs-on: self-hosted

    steps:
    - name: Check out repository
      uses: actions/checkout@v3
    - name: Generate compilation database
      uses: cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON .
    - name: Analyze pull request
      uses: polyspace-actions/polyspace-bug-finder@24.1.0
      with:
        compilation-database-file: compile_commands.json
        checkers-file: checkers.xml
        sarif-file: results.sarif

    - name: Annotate the findings to the commit
      uses: polyspace-actions/polyspace-findings@24.1.0
      with:
        sarif-file: results.sarif
```

## Contributing

This project welcomes contributions. Please refer to CONTRIBUTING.md for details.

## See Also

- [Complete List of Polyspace Bug Finder Analysis Engine Options](https://www.mathworks.com/help/bugfinder/analysis-options.html)
- [Complete List of Polyspace Bug Finder Results](https://www.mathworks.com/help/bugfinder/check-reference.html)

## Contact Us

If you have any questions or suggestions, please contact MathWorks® at [continuous-integration@mathworks.com](mailto:continuous-integration@mathworks.com).
