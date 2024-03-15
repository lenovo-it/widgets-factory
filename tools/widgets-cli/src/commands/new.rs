use crate::error::{AppError, AppResult};
use crate::features::{flags, params};
use inquire::validator::Validation;
use napi::bindgen_prelude::*;
use once_cell::sync::Lazy;
use std::path;
use strum::IntoEnumIterator;

/// File name placeholder.
static FILE_NAME_PLACEHOLDER_REGEXP: Lazy<regex::Regex> =
  Lazy::new(|| regex::Regex::new(r"\$NAME\$").unwrap());

// File name validation.
// static FILE_NAME_VALID_REGEXP: Lazy<regex::Regex> =
//   Lazy::new(|| regex::Regex::new(r"^[^/:?<>|*]*$").unwrap());

// Valid tag name validation.
// Should with `hyphen`.
static TAG_NAME_VALID_REGEXP: Lazy<regex::Regex> =
  Lazy::new(|| regex::Regex::new(r"^[a-zA-Z]?(?:[a-zA-Z0-9]+-)+[a-zA-Z0-9]+$").unwrap());

fn judge_file_name_valid(target_dir: &str, name: &str) -> AppResult<()> {
  if name.is_empty() || !TAG_NAME_VALID_REGEXP.is_match(name) {
    return Err(AppError::InvalidWidgetName);
  }

  if path::Path::new(target_dir).join(name).exists() {
    return Err(AppError::WidgetAlreadyExists);
  }

  return Ok(());
}

/// Exec the "new" command.
pub fn exec(
  _cli: &flags::Cli,
  new_flags: &flags::SubCommandNewFlags,
  params: &params::RunParams,
) -> Result<Undefined> {
  let mut name = new_flags
    .name
    .as_ref()
    .and_then(|s| Some(s.clone().to_lowercase()));

  while name.is_none()
    || name
      .as_ref()
      .is_some_and(|n| judge_file_name_valid(&params.target_dir, n).is_err())
  {
    let target_dir = params.target_dir.clone();

    let _ = name.insert(
      inquire::Text::new("Please input the widget name.")
        .with_placeholder("test-widget")
        .with_help_message("The widget name should contain the hyphen(-) symbol.")
        .with_validator(move |s: &'_ str| {
          Ok(judge_file_name_valid(&target_dir, s).map_or_else(
            |e| Validation::Invalid(e.to_string().into()),
            |_| Validation::Valid,
          ))
        })
        .prompt()
        .map_err(|e| Error::new(Status::Unknown, e.to_string()))?
        .to_lowercase(),
    );
  }

  let mut flavour = new_flags.flavour.as_ref().and_then(|f| Some(f.clone()));
  while flavour.is_none() {
    let _ = flavour.insert(
      inquire::Select::new(
        "Please choose the widget flavour.",
        flags::SubCommandNewFlavours::iter().collect::<Vec<_>>(),
      )
      .prompt()
      .map_err(|e| Error::new(Status::Unknown, e.to_string()))?
      .into(),
    );
  }

  match flavour {
    None => {
      return Ok(());
    }
    Some(flavour) => {
      // Create all the folders.
      fs_extra::dir::create_all(
        path::Path::new(&params.target_dir).join(name.as_ref().unwrap()),
        false,
      )
      .map_err(|e| Error::new(Status::Unknown, e.to_string()))?;

      // Copy folder.
      fs_extra::dir::copy(
        path::Path::new(&params.current_dir)
          .join("templates")
          .join(format!("{:?}", flavour)),
        path::Path::new(&params.target_dir).join(name.as_ref().unwrap()),
        &fs_extra::dir::CopyOptions::new().content_only(true), // Only copy the items under the dir.
      )
      .map_err(|e| Error::new(Status::Unknown, e.to_string()))?;

      // Replace the placeholders.
      fs_extra::dir::get_dir_content(
        path::Path::new(&params.target_dir).join(name.as_ref().unwrap()),
      )
      .map_err(|e| Error::new(Status::Unknown, e.to_string()))?
      .files
      .iter()
      .for_each(|file_path| {
        let file_content = fs_extra::file::read_to_string(file_path).unwrap();
        let file_content = file_content.as_str();

        if !FILE_NAME_PLACEHOLDER_REGEXP.is_match(file_content) {
          return;
        }

        let file_content =
          FILE_NAME_PLACEHOLDER_REGEXP.replace_all(file_content, name.as_ref().unwrap());
        let file_content = file_content.as_ref();

        let _ = fs_extra::file::write_all(file_path, file_content);
      });
    }
  }

  Ok(())
}
