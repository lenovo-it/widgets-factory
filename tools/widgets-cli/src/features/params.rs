#[napi(object)]
pub struct RunParams {
  pub current_dir: String,
  pub target_dir: String,
}
