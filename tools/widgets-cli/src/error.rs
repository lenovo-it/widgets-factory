#[derive(thiserror::Error, Debug)]
pub enum AppError {
  #[error("Unexpected issue.")]
  UnexpectedIssue,
  #[error("Widget already exists.")]
  WidgetAlreadyExists,
  #[error("Invalid widget name.")]
  InvalidWidgetName,
}

pub type AppResult<T> = std::result::Result<T, AppError>;
